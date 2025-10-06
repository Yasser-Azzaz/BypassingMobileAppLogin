Java.perform(function () {
    console.log("[*] ===== SUCCESS TRIGGERING BYPASS =====");
    console.log("[*] This script will actively trigger success instead of just blocking failure");
    
    // ---------- Helpers ----------
    function safeStr(v) {
        try { 
            return v ? v.toString() : null; 
        } catch (e) { 
            return null; 
        }
    }
    
    // Store references for success triggering
    var loginActivityInstance = null;
    var successTriggered = false;
    
    // ---------- Integer.parseInt Guards (Keep these - they prevent crashes) ----------
    try {
        var IntegerClass = Java.use("java.lang.Integer");
        var orig_parse1 = IntegerClass.parseInt.overload('java.lang.String');
        var orig_parse2 = IntegerClass.parseInt.overload('java.lang.String', 'int');
        
        orig_parse1.implementation = function (s) {
            var ss = safeStr(s);
            if (ss === null || ss === undefined || ss.length === 0) {
                console.log("[GUARD] Integer.parseInt: empty input, returning 0");
                return 0;
            }
            return orig_parse1.call(this, s);
        };
        
        orig_parse2.implementation = function (s, radix) {
            var ss = safeStr(s);
            if (ss === null || ss === undefined || ss.length === 0) {
                console.log("[GUARD] Integer.parseInt(radix): empty input, returning 0");
                return 0;
            }
            return orig_parse2.call(this, s, radix);
        };
        
        console.log("[✓] Integer.parseInt guards installed");
    } catch (e) {
        console.log("[!] parseInt guards failed: " + e);
    }
    
    // ---------- Hook LoginActivity methods ----------
    setTimeout(function() {
        try {
            var LoginActivity = Java.use("com.facebook.katana.act.LoginActivity");
            console.log("[✓] LoginActivity class loaded");
            
            // Hook onCreate to capture the activity instance
            LoginActivity.onCreate.implementation = function(savedInstanceState) {
                console.log("\n[*] LoginActivity.onCreate() called");
                loginActivityInstance = this;
                console.log("[INFO] Stored activity instance for success triggering");
                
                // Call original onCreate
                return this.onCreate(savedInstanceState);
            };
            
            // Hook Check method - return success immediately
            try {
                LoginActivity.Check.implementation = function (ctx, arg) {
                    console.log("\n[*] Check() method intercepted");
                    console.log("[*] Input arg: " + safeStr(arg));
                    console.log("[BYPASS] Returning SUCCESS immediately");
                    return "SUCCESS";
                };
                console.log("[✓] Check method bypassed");
            } catch (e) {
                console.log("[!] Check hook failed: " + e);
            }
            
            // Hook Sign method
            try {
                LoginActivity.Sign.implementation = function () {
                    console.log("\n[*] Sign() method intercepted");
                    console.log("[BYPASS] Returning valid signature");
                    return "ff:f3:03:c5:00:0e:12:1c:f3:b2:fe:11:4f:66:2b:50";
                };
                console.log("[✓] Sign method bypassed");
            } catch (e) {
                console.log("[!] Sign hook failed: " + e);
            }
            
            // Root detection bypass (REMOVED)
//            try {
//                LoginActivity.validateRootAccess.implementation = function () {
//                    console.log("[BYPASS] Root detection bypassed");
//                    return;
//                };
//                console.log("[✓] Root detection bypassed");
//            } catch (e) {
//                console.log("[!] Root detection hook failed: " + e);
//            }
            
            // Try to find success handling method
            try {
                // Look for methods that might handle successful login
                var methods = LoginActivity.class.getDeclaredMethods();
                for (var i = 0; i < methods.length; i++) {
                    var methodName = methods[i].getName();
                    
                    if (methodName.includes("success") || methodName.includes("Success") || 
                        methodName.includes("proceed") || methodName.includes("Proceed") ||
                        methodName.includes("continue") || methodName.includes("Continue") ||
                        methodName.includes("next") || methodName.includes("Next")) {
                        
                        console.log("[INFO] Found potential success method: " + methodName);
                        
                        try {
                            var successMethod = LoginActivity[methodName];
                            if (successMethod) {
                                console.log("[INFO] Successfully got reference to: " + methodName);
                            }
                        } catch (e) {
                            // Method might not be accessible
                        }
                    }
                }
            } catch (e) {
                console.log("[INFO] Could not enumerate methods: " + e);
            }
            
            console.log("[✓] LoginActivity hooks installed");
            
        } catch (err) {
            console.log("[!] LoginActivity hook failed: " + err);
        }
        
    }, 2000);
    
    // ---------- Enhanced Message Handler with Success Triggering ----------
    setTimeout(function() {
        try {
            var handlerClass = "com.facebook.katana.act.LoginActivity$斢衔鬹愠狱堪钓骖禞吳郀沜跲褼弦硠餓軓刧篖憯秃弳垜撤";
            var Handler = Java.use(handlerClass);
            
            Handler.handleMessage.implementation = function(message) {
                console.log("\n[INTERCEPT] Message Handler Called");
                
                try {
                    var msgObj = null;
                    var msgWhat = -1;
                    
                    if (message.obj) {
                        msgObj = safeStr(message.obj.value || message.obj);
                    }
                    if (message.what) {
                        msgWhat = message.what.value || message.what;
                    }
                    
                    console.log("[INTERCEPT] Message what: " + msgWhat);
                    console.log("[INTERCEPT] Message obj: " + msgObj);
                    
                    // If it's a failure message, create and send success message instead
                    if (msgObj && (msgObj.includes("NOT REGISTERED") || msgObj.includes("FAIL"))) {
                        console.log("[BYPASS] *** FAILURE MESSAGE DETECTED ***");
                        console.log("[BYPASS] Creating SUCCESS message instead...");
                        
                        if (!successTriggered) {
                            successTriggered = true;
                            
                            try {
                                // Create a new success message
                                var Message = Java.use("android.os.Message");
                                var successMessage = Message.obtain();
                                successMessage.what = 1; // Keep same message type
                                successMessage.obj = "SUCCESS"; // Change content to success
                                
                                console.log("[BYPASS] Created success message");
                                console.log("[BYPASS] Sending success message to handler...");
                                
                                // Send the success message
                                var result = this.handleMessage(successMessage);
                                console.log("[BYPASS] Success message sent!");
                                return result;
                                
                            } catch (e) {
                                console.log("[ERROR] Failed to create success message: " + e);
                                
                                // Alternative approach: try to trigger success via activity methods
                                try {
                                    if (loginActivityInstance) {
                                        console.log("[BYPASS] Trying alternative success trigger...");
                                        
                                        // Try to call runOnUiThread to update UI
                                        var Runnable = Java.use("java.lang.Runnable");
                                        var successRunnable = Java.registerClass({
                                            name: "com.frida.SuccessRunnable",
                                            implements: [Runnable],
                                            methods: {
                                                run: function() {
                                                    console.log("[BYPASS] Success runnable executed - login should proceed");
                                                }
                                            }
                                        });
                                        
                                        loginActivityInstance.runOnUiThread(successRunnable.$new());
                                        console.log("[BYPASS] Alternative success trigger sent");
                                        
                                    }
                                } catch (e2) {
                                    console.log("[ERROR] Alternative success trigger failed: " + e2);
                                }
                                
                                // Just block the failure message as fallback
                                console.log("[BYPASS] Blocking failure message");
                                return;
                            }
                        } else {
                            console.log("[BYPASS] Success already triggered, blocking duplicate failure");
                            return;
                        }
                    }
                    
                    // Process other messages normally
                    console.log("[INFO] Processing message normally");
                    return this.handleMessage(message);
                    
                } catch (e) {
                    console.log("[ERROR] Message processing error: " + e);
                    return;
                }
            };
            
            console.log("[✓] Enhanced message handler installed");
            
        } catch (e) {
            console.log("[!] Message handler hook failed: " + e);
        }
        
    }, 3000);
    
    // ---------- UI Thread Helper ----------
    setTimeout(function() {
        try {
            // Try to hook methods that might update the UI after login
            var LoginActivity = Java.use("com.facebook.katana.act.LoginActivity");
            
            // Look for methods that might hide loading spinner or show next screen
            var possibleUIUpdaters = ["hideLoading", "hideProgress", "showMainScreen", "proceedToMain", "finishLogin"];
            
            possibleUIUpdaters.forEach(function(methodName) {
                try {
                    if (LoginActivity[methodName]) {
                        console.log("[INFO] Found UI updater method: " + methodName);
                        
                        // Hook it to see when it's called
                        var originalMethod = LoginActivity[methodName];
                        LoginActivity[methodName].implementation = function() {
                            console.log("[UI] " + methodName + "() called");
                            return originalMethod.apply(this, arguments);
                        };
                    }
                } catch (e) {
                    // Method doesn't exist, skip
                }
            });
            
        } catch (e) {
            console.log("[INFO] UI method enumeration failed: " + e);
        }
    }, 4000);
    
    console.log("\n[SUCCESS] ===== SUCCESS TRIGGERING SCRIPT LOADED =====");
    console.log("[SUCCESS] This script will:");
    console.log("[SUCCESS] 1. Block failure messages");
    console.log("[SUCCESS] 2. Create and send SUCCESS messages instead");
    console.log("[SUCCESS] 3. Try multiple approaches to trigger success flow");
    console.log("[SUCCESS] Try logging in now!");
    console.log("===============================================");
});
