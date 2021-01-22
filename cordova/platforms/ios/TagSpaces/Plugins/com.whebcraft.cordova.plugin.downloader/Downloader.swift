import Foundation

@objc(Downloader) class Downloader : CDVPlugin {
    func download(_ command: CDVInvokedUrlCommand) {
        var pluginResult = CDVPluginResult(
            status: CDVCommandStatus_ERROR
        )

        var isError = false

        let args = command.arguments[0] as! NSDictionary
        let url = URL(string: args["url"] as! String)
        let targetFile = args["path"] as! String

        let documentsUrl =  FileManager.default.urls(for: .documentDirectory, in: .userDomainMask).first as URL?
        let destinationUrl = documentsUrl?.appendingPathComponent(targetFile)

        if FileManager().fileExists(atPath: destinationUrl!.path) {
            print("file already exists [\(destinationUrl?.path)]")
            do {
                try FileManager().removeItem(atPath: destinationUrl!.path)
            }
            catch let error as NSError {
                pluginResult = CDVPluginResult(
                    status: CDVCommandStatus_ERROR,
                    messageAs: error.localizedDescription
                )

                self.commandDelegate!.send(
                    pluginResult,
                    callbackId: command.callbackId
                )

                isError = true
            }
        }
        if !(isError) {
            let sessionConfig = URLSessionConfiguration.default
            let session = URLSession(configuration: sessionConfig, delegate: nil, delegateQueue: nil)
            var request = URLRequest(url: url!)
            request.httpMethod = "GET"
            let task = session.dataTask(with: request, completionHandler: { (data: Data?, response: URLResponse?, error: Error?) -> Void in
                if (error == nil) {
                    if let response = response as? HTTPURLResponse {
                        if response.statusCode == 200 {
                            if (try? data!.write(to: destinationUrl!, options: [.atomic])) != nil {
                                pluginResult = CDVPluginResult(
                                    status: CDVCommandStatus_OK,
                                    messageAs: documentsUrl?.path
                                )

                                self.commandDelegate!.send(
                                    pluginResult,
                                    callbackId: command.callbackId
                                )
                            }
                        }
                    }
                }
            })
            task.resume()
        }
    }
}
