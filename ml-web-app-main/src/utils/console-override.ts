// Override console methods to disable warnings and errors
if (typeof window !== 'undefined') {
  
  // Override console.warn
  console.warn = function() {
    // Do nothing - warnings are disabled
  };
  
  // Override console.error
  console.error = function() {
    // Do nothing - errors are disabled
  };
  
  // Override console.log if you want to disable logs as well
  console.log = function() {
    // Do nothing - logs are disabled
  };
}

export {}; 