/**
 * src/lib/IntentStack.ts
 * 
 * Class to track a stack of player intentions.
 */

type IntentType = {
    action: () => void;  // Action to execute when the intent is satisfied
    satisfiable: () => boolean;  // Condition to check if the intent can be satisfied
};

/**
 * Extending the Array class to use it as a stack
 * 
 * @example ```
    // Example usage
    const intents = new Intent();

    // Adding an intent
    intents.pushIntent({
        action: () => console.log("Intent executed!"),
        satisfiable: () => true,  // The logic that runs every game update() tick and determines if the intent has been satisfied.
    });

    // Every game tick, call this to check the top intent
    intents.checkTopIntent();
    ```
 */
class IntentStack extends Array<IntentType> {
    pushIntent(intent: IntentType) {
        this.push(intent);  // Push a new intent onto the stack
    }

    checkTopIntent() {
        const topIntent = this[this.length - 1];  // Get the intent at the top of the stack
        if (topIntent && topIntent.satisfiable()) {
            topIntent.action();  // Execute the action if satisfiable
            this.pop();  // Remove the intent from the stack
        }
    }
    
}


export default IntentStack;