Java.perform(function() {
    console.log("[+] SSL Pinning Bypass Started");
    
    // Bypass TrustManagerImpl
    var TrustManagerImpl = Java.use("com.android.org.conscrypt.TrustManagerImpl");
    TrustManagerImpl.checkTrustedRecursive.implementation = function(a1, a2, a3, a4, a5, a6) {
        console.log("[+] Bypassing TrustManagerImpl checkTrusted");
        return Java.use("java.util.List").$new();
    }
    
    TrustManagerImpl.verifyChain.implementation = function(untrustedChain, trustAnchorChain, host, clientAuth, ocspData, tlsSctData) {
        console.log("[+] Bypassing TrustManagerImpl verifyChain");
        return untrustedChain;
    }
    
    // Bypass OkHTTPv3
    try {
        var okhttp3_CertificatePinner_check = Java.use("okhttp3.CertificatePinner");
        okhttp3_CertificatePinner_check.check.overload('java.lang.String', 'java.util.List').implementation = function(a, b) {
            console.log("[+] Bypassing OkHTTPv3 Certificate Pinning");
            return;
        };
    } catch (e) {
        console.log("[-] OkHTTPv3 not found");
    }
    
    // Bypass WebView
    try {
        var WebViewClient = Java.use("android.webkit.WebViewClient");
        WebViewClient.onReceivedSslError.implementation = function(view, handler, error) {
            console.log("[+] Bypassing WebView SSL Error");
            handler.proceed();
        };
    } catch (e) {
        console.log("[-] WebViewClient not found");
    }
    
    console.log("[+] SSL Pinning Bypass Complete");
});