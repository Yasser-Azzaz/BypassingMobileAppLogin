Java.perform(function () {
    console.log("[*] Starting dynamic class monitoring...");
    console.log("[*] Launch the app and navigate to login screen, then try to login");
    
    var initialClasses = new Set();
    var appSpecificClasses = [];
    
    // Get initial class list
    Java.enumerateLoadedClasses({
        onMatch: function (className) {
            initialClasses.add(className);
        },
        onComplete: function () {
            console.log("[*] Initial class scan complete: " + initialClasses.size + " classes");
            startMonitoring();
        }
    });
    
    function startMonitoring() {
        console.log("[*] Starting to monitor for new classes...");
        console.log("[*] Now perform login actions in the app!");
        
        setInterval(function() {
            Java.enumerateLoadedClasses({
                onMatch: function (className) {
                    if (!initialClasses.has(className)) {
                        // New class found!
                        if (className.includes("yg") || 
                            className.includes("cnuigeth") ||
                            className.toLowerCase().includes("login") ||
                            className.toLowerCase().includes("auth") ||
                            className.toLowerCase().includes("verify") ||
                            className.toLowerCase().includes("check") ||
                            className.toLowerCase().includes("key") ||
                            className.toLowerCase().includes("credential")) {
                            
                            console.log("[NEW] Found interesting new class: " + className);
                            appSpecificClasses.push(className);
                            exploreClass(className);
                        }
                        initialClasses.add(className);
                    }
                },
                onComplete: function () {}
            });
        }, 2000); // Check every 2 seconds
    }
    
    function exploreClass(className) {
        try {
            var clazz = Java.use(className);
            console.log("\n=== Exploring " + className + " ===");
            
            var methods = clazz.class.getDeclaredMethods();
            methods.forEach(function (method) {
                var methodName = method.getName();
                console.log("    Method: " + methodName + " " + method.toString());
                
                // Auto-hook interesting methods
                if (methodName.toLowerCase().includes("login") ||
                    methodName.toLowerCase().includes("auth") ||
                    methodName.toLowerCase().includes("verify") ||
                    methodName.toLowerCase().includes("check") ||
                    methodName.toLowerCase().includes("validate") ||
                    methodName.toLowerCase().includes("key")) {
                    
                    console.log("    [HOOKING] " + methodName);
                    hookMethodSafely(clazz, methodName);
                }
            });
            
            // Look for fields too
            var fields = clazz.class.getDeclaredFields();
            fields.forEach(function (field) {
                console.log("    Field: " + field.getName() + " (" + field.getType() + ")");
            });
            
        } catch (e) {
            console.log("[!] Failed to explore " + className + ": " + e);
        }
    }
    
    function hookMethodSafely(clazz, methodName) {
        try {
            clazz[methodName].overloads.forEach(function (overload) {
                overload.implementation = function () {
                    console.log("\n[HOOK] Called " + clazz.$className + "." + methodName);
                    
                    // Log arguments
                    for (var i = 0; i < arguments.length; i++) {
                        console.log("    arg[" + i + "]: " + arguments[i]);
                    }
                    
                    // Call original method first to see what happens
                    var result = this[methodName].apply(this, arguments);
                    console.log("    Original result: " + result);
                    console.log("    Return type: " + overload.returnType.type);
                    
                    // Return original result for now (we can modify later)
                    return result;
                };
            });
        } catch (e) {
            console.log("[!] Failed to hook " + methodName + ": " + e);
        }
    }
    
    // Also hook the Samsung ICCC class we found
    try {
        console.log("[*] Attempting to hook Samsung ICCC...");
        var iccc = Java.use("com.samsung.android.iccc.IntegrityControlCheckCenter");
        var icccMethods = iccc.class.getDeclaredMethods();
        console.log("[ICCC] Found " + icccMethods.length + " methods:");
        
        icccMethods.forEach(function (method) {
            var methodName = method.getName();
            console.log("    ICCC Method: " + methodName);
            if (methodName.includes("check") || methodName.includes("verify") || methodName.includes("validate")) {
                console.log("    [HOOKING ICCC] " + methodName);
                hookMethodSafely(iccc, methodName);
            }
        });
    } catch (e) {
        console.log("[!] Failed to hook ICCC: " + e);
    }
});