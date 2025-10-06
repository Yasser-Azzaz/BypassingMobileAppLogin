Java.perform(function () {
    console.log("[*] Looking for potentially obfuscated app classes...");
    
    var suspiciousClasses = [];
    var shortNameClasses = [];
    
    Java.enumerateLoadedClasses({
        onMatch: function (className) {
            // Look for classes that might belong to the app
            // Short class names (common in obfuscated apps)
            var parts = className.split('.');
            var lastPart = parts[parts.length - 1];
            
            if (lastPart.length <= 3 && 
                !className.startsWith('android.') && 
                !className.startsWith('java.') && 
                !className.startsWith('javax.') &&
                !className.startsWith('com.android.') &&
                !className.startsWith('sun.') &&
                !className.startsWith('gov.nist.') &&
                !className.startsWith('dalvik.')) {
                shortNameClasses.push(className);
            }
            
            // Look for classes that might contain the app package or similar
            if (className.includes('yg') || 
                className.includes('cnui') ||
                (!className.startsWith('android.') && 
                 !className.startsWith('java.') && 
                 !className.startsWith('javax.') &&
                 !className.startsWith('com.android.') &&
                 !className.startsWith('sun.') &&
                 !className.startsWith('gov.nist.') &&
                 !className.startsWith('dalvik.') &&
                 !className.startsWith('com.samsung.') &&
                 parts.length <= 3)) {
                suspiciousClasses.push(className);
            }
        },
        onComplete: function () {
            console.log("\n[*] Short-named classes (possibly obfuscated): " + shortNameClasses.length);
            shortNameClasses.forEach(function(cls) {
                console.log("    " + cls);
                exploreShortClass(cls);
            });
            
            console.log("\n[*] Other suspicious classes: " + suspiciousClasses.length);
            suspiciousClasses.forEach(function(cls) {
                console.log("    " + cls);
            });
            
            console.log("\n[*] Analysis complete. Try triggering login actions now.");
        }
    });
    
    function exploreShortClass(className) {
        try {
            var clazz = Java.use(className);
            var methods = clazz.class.getDeclaredMethods();
            
            console.log("      Methods in " + className + ":");
            methods.forEach(function (method) {
                var methodName = method.getName();
                var paramCount = method.getParameterTypes().length;
                console.log("        " + methodName + "(" + paramCount + " params)");
                
                // Hook methods that take String parameters (potential key/credential methods)
                if (paramCount > 0 && (methodName.length <= 3 || methodName.includes("a") || methodName.includes("b"))) {
                    hookSuspiciousMethod(clazz, methodName);
                }
            });
        } catch (e) {
            console.log("      [!] Could not explore " + className);
        }
    }
    
    function hookSuspiciousMethod(clazz, methodName) {
        try {
            clazz[methodName].overloads.forEach(function (overload) {
                overload.implementation = function () {
                    console.log("\n[SUSPICIOUS] " + clazz.$className + "." + methodName + " called!");
                    
                    for (var i = 0; i < arguments.length; i++) {
                        var arg = arguments[i];
                        if (arg && typeof arg === 'string') {
                            console.log("    String arg[" + i + "]: '" + arg + "'");
                        } else if (arg && typeof arg === 'object') {
                            console.log("    Object arg[" + i + "]: " + arg.toString());
                        } else {
                            console.log("    arg[" + i + "]: " + arg);
                        }
                    }
                    
                    var result = this[methodName].apply(this, arguments);
                    console.log("    Result: " + result);
                    
                    return result;
                };
            });
        } catch (e) {
            // Ignore failed hooks
        }
    }
});