Java.perform(function () {
    console.log("[*] Message-Level Bypass Script v2 - Fixed");
    console.log("[*] This approach modifies the result messages safely");
    
    setTimeout(function() {
        try {
            // Hook the message handler class with better error handling
            var handlerClass = "com.facebook.katana.act.LoginActivity$斢衔鬹愠狱堪钓骖禞吳郀沜跲褼弦硠餓軓刧篖憯秃弳垜撤";
            var Handler = Java.use(handlerClass);
            
            Handler.handleMessage.implementation = function (message) {
                console.log("\n[INTERCEPT] Message Handler Called");
                
                try {
                    // Safely extract message information
                    var messageWhat = -1;
                    var messageObj = null;
                    
                    if (message.what !== undefined && message.what !== null) {
                        messageWhat = message.what.value || message.what;
                    }
                    
                    if (message.obj !== undefined && message.obj !== null) {
                        messageObj = message.obj.value || message.obj;
                    }
                    
                    console.log("[INTERCEPT] Message what: " + messageWhat);
                    console.log("[INTERCEPT] Message obj: " + messageObj);
                    
                    // Check if this is a login failure message
                    if (messageObj && messageObj.toString().includes("NOT REGISTERED")) {
                        console.log("[BYPASS] Found failure message - attempting bypass");
                        
                        // Instead of modifying the original message (which causes crashes),
                        // we'll create a completely new message or skip processing
                        console.log("[BYPASS] Skipping failure message processing");
                        
                        // Don't call the original handler for failure messages
                        return;
                    }
                    
                    // For success messages or other messages, call original handler
                    console.log("[INFO] Processing message normally");
                    return this.handleMessage(message);
                    
                } catch (e) {
                    console.log("[ERROR] Error in message processing: " + e);
                    // In case of error, don't process the message to avoid crashes
                    return;
                }
            };
            
            console.log("[SUCCESS] Message handler hooked safely!");
            
        } catch (e) {
            console.log("[ERROR] Failed to hook message handler: " + e);
        }
        
        // Root bypass with better error handling
        try {
            var LoginActivity = Java.use("com.facebook.katana.act.LoginActivity");
            
            LoginActivity.validateRootAccess.implementation = function () {
                console.log("[BYPASS] Root check bypassed");
                return;
            };
            
            console.log("[SUCCESS] Root bypass installed!");
            
        } catch (e) {
            console.log("[ERROR] Failed to install root bypass: " + e);
        }
        
        // Additional hook to prevent the app from showing failure UI
        try {
            var LoginActivity = Java.use("com.facebook.katana.act.LoginActivity");
            
            // Look for methods that might show error dialogs or failure UI
            var ActivityMethods = LoginActivity.class.getDeclaredMethods();
            for (var i = 0; i < ActivityMethods.length; i++) {
                var methodName = ActivityMethods[i].getName();
                
                // Hook methods that might display error messages
                if (methodName.includes("showError") || methodName.includes("showFail") || 
                    methodName.includes("displayError") || methodName.includes("onFail")) {
                    
                    console.log("[*] Hooking potential error display method: " + methodName);
                    
                    try {
                        var errorMethod = LoginActivity[methodName];
                        if (errorMethod) {
                            errorMethod.implementation = function() {
                                console.log("[BYPASS] Blocked error display method: " + methodName);
                                // Don't show error - just return
                                return;
                            };
                        }
                    } catch (e) {
                        // Method might not be hookable, skip it
                        console.log("[INFO] Could not hook " + methodName + ": " + e);
                    }
                }
            }
            
        } catch (e) {
            console.log("[INFO] Could not enumerate methods for error blocking: " + e);
        }
        
    }, 1000);
});