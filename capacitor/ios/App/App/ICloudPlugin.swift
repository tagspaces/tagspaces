import Foundation
import Capacitor

@objc(ICloudPlugin)
public class ICloudPlugin: CAPPlugin, CAPBridgedPlugin {
    public let identifier = "ICloudPlugin"
    public let jsName = "ICloud"
    public let pluginMethods: [CAPPluginMethod] = [
        CAPPluginMethod(name: "getUbiquityContainer", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "startDownload", returnType: CAPPluginReturnPromise)
    ]

    private static let containerID = "iCloud.org.tagspaces.mobileapp"

    @objc func getUbiquityContainer(_ call: CAPPluginCall) {
        // Must run off the main thread — this call can block while iCloud sets
        // up the container. Try the explicit container identifier first (passing
        // nil is unreliable), then fall back to nil (first entitlement container).
        DispatchQueue.global(qos: .userInitiated).async {
            let fm = FileManager.default
            let token = fm.ubiquityIdentityToken
            CAPLog.print("[ICloud] ubiquityIdentityToken present: \(token != nil)")

            let containerURL = fm.url(forUbiquityContainerIdentifier: ICloudPlugin.containerID)
                ?? fm.url(forUbiquityContainerIdentifier: nil)

            guard let containerURL = containerURL else {
                // token == nil → user not signed into iCloud / iCloud Drive off.
                // token != nil but url nil → entitlement/container provisioning issue.
                let reason = token == nil
                    ? "not-signed-in"
                    : "container-unavailable"
                CAPLog.print("[ICloud] container URL is nil, reason: \(reason)")
                call.resolve(["available": false, "reason": reason])
                return
            }

            let documentsURL = containerURL.appendingPathComponent("Documents", isDirectory: true)
            do {
                try fm.createDirectory(at: documentsURL, withIntermediateDirectories: true)
            } catch {
                CAPLog.print("[ICloud] createDirectory failed: \(error.localizedDescription)")
            }
            CAPLog.print("[ICloud] resolved documentsPath: \(documentsURL.path)")
            call.resolve([
                "available": true,
                "containerPath": containerURL.path,
                "documentsPath": documentsURL.path
            ])
        }
    }

    @objc func startDownload(_ call: CAPPluginCall) {
        guard let path = call.getString("path") else {
            call.reject("path is required")
            return
        }
        let url = URL(fileURLWithPath: path)
        do {
            try FileManager.default.startDownloadingUbiquitousItem(at: url)
            call.resolve(["started": true])
        } catch {
            call.reject("startDownloadingUbiquitousItem failed: \(error.localizedDescription)")
        }
    }
}
