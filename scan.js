Java.perform(function () {
    console.log("[*] Starting comprehensive class scan...");
    
    var appClasses = [];
    var allClasses = [];
    
    Java.enumerateLoadedClasses({
        onMatch: function (className) {
            allClasses.push(className);
            
            // Look for classes belonging to your target app
            if (className.startsWith("yg.cnuigeth") || 
                className.includes("yg") ||
                className.toLowerCase().includes("login") ||
                className.toLowerCase().includes("auth") ||
                className.toLowerCase().includes("verify") ||
                className.toLowerCase().includes("check") ||
                className.toLowerCase().includes("validate")) {
                appClasses.push(className);
            }
        },
        onComplete: function () {
            console.log("\n[*] App-specific classes found: " + appClasses.length);
            appClasses.forEach(function(cls) {
                console.log("    " + cls);
            });
            
            console.log("\n[*] Total classes scanned: " + allClasses.length);
            console.log("[*] Scan complete. Try interacting with the login screen now.");
        }
    });
});