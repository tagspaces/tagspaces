#import "NSString+SSURLEncoding.h"

@implementation NSString (SSURLEncoding)
- (NSString*)SSURLEncodedString
{
  NSString* result = (NSString *)CFBridgingRelease(
                          CFURLCreateStringByAddingPercentEscapes(
                                kCFAllocatorDefault,
                                (CFStringRef)self,
                                CFSTR("#%"), // don't escape these
                                NULL, // allow escaping these
                                kCFStringEncodingUTF8
                          )
                     );
  
  // we may have a URL with more than one '#' now - which iOS doesn't allow, so escape all but the first one
  NSArray *parts = [result componentsSeparatedByString:@"#"];
  NSString *finalResult = parts[0];
  for (int i=1; i<parts.count; i++) {
    NSString *part = [parts objectAtIndex:i];
    if (i==1) {
      finalResult = [finalResult stringByAppendingString:@"#"];
    } else {
      finalResult = [finalResult stringByAppendingString:@"%23"];
    }
    finalResult = [finalResult stringByAppendingString:part];
  }
  return finalResult;
}
@end
