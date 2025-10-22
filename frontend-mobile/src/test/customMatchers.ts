// Custom Jest matchers for MalPay Mobile App
import 'jest-extended';

// Custom matcher for Redux state
expect.extend({
  toHaveReduxState(received, expectedState) {
    const pass = this.equals(received.getState(), expectedState);
    
    if (pass) {
      return {
        message: () => `expected Redux store not to have state ${this.utils.printExpected(expectedState)}`,
        pass: true,
      };
    } else {
      return {
        message: () => `expected Redux store to have state ${this.utils.printExpected(expectedState)}, but got ${this.utils.printReceived(received.getState())}`,
        pass: false,
      };
    }
  },
  
  toHaveReduxAction(received, expectedAction) {
    const actions = received.getActions();
    const pass = actions.some(action => 
      action.type === expectedAction.type && 
      this.equals(action.payload, expectedAction.payload)
    );
    
    if (pass) {
      return {
        message: () => `expected Redux store not to have dispatched action ${this.utils.printExpected(expectedAction)}`,
        pass: true,
      };
    } else {
      return {
        message: () => `expected Redux store to have dispatched action ${this.utils.printExpected(expectedAction)}, but got ${this.utils.printReceived(actions)}`,
        pass: false,
      };
    }
  },
  
  toHaveNavigationCall(received, expectedNavigation) {
    const pass = received.mock.calls.some(call => 
      call[0] === expectedNavigation.screen &&
      this.equals(call[1], expectedNavigation.params)
    );
    
    if (pass) {
      return {
        message: () => `expected navigation not to have been called with ${this.utils.printExpected(expectedNavigation)}`,
        pass: true,
      };
    } else {
      return {
        message: () => `expected navigation to have been called with ${this.utils.printExpected(expectedNavigation)}, but got ${this.utils.printReceived(received.mock.calls)}`,
        pass: false,
      };
    }
  },
  
  toHaveFormValidation(received, expectedValidation) {
    const pass = received.isValid === expectedValidation.isValid &&
      this.equals(received.errors, expectedValidation.errors);
    
    if (pass) {
      return {
        message: () => `expected form validation not to be ${this.utils.printExpected(expectedValidation)}`,
        pass: true,
      };
    } else {
      return {
        message: () => `expected form validation to be ${this.utils.printExpected(expectedValidation)}, but got ${this.utils.printReceived(received)}`,
        pass: false,
      };
    }
  },
  
  toHaveCurrencyFormat(received, expectedFormat) {
    const currencyRegex = /^[₦$€£]\d{1,3}(,\d{3})*(\.\d{2})?$/;
    const pass = currencyRegex.test(received) && received === expectedFormat;
    
    if (pass) {
      return {
        message: () => `expected currency not to be formatted as ${this.utils.printExpected(expectedFormat)}`,
        pass: true,
      };
    } else {
      return {
        message: () => `expected currency to be formatted as ${this.utils.printExpected(expectedFormat)}, but got ${this.utils.printReceived(received)}`,
        pass: false,
      };
    }
  },
  
  toHaveTransactionStatus(received, expectedStatus) {
    const validStatuses = ['pending', 'processing', 'completed', 'failed', 'cancelled'];
    const pass = validStatuses.includes(received) && received === expectedStatus;
    
    if (pass) {
      return {
        message: () => `expected transaction status not to be ${this.utils.printExpected(expectedStatus)}`,
        pass: true,
      };
    } else {
      return {
        message: () => `expected transaction status to be ${this.utils.printExpected(expectedStatus)}, but got ${this.utils.printReceived(received)}`,
        pass: false,
      };
    }
  },
  
  toHaveWalletBalance(received, expectedBalance) {
    const pass = received.balance === expectedBalance.balance &&
      received.currency === expectedBalance.currency;
    
    if (pass) {
      return {
        message: () => `expected wallet balance not to be ${this.utils.printExpected(expectedBalance)}`,
        pass: true,
      };
    } else {
      return {
        message: () => `expected wallet balance to be ${this.utils.printExpected(expectedBalance)}, but got ${this.utils.printReceived(received)}`,
        pass: false,
      };
    }
  },
  
  toHaveAPIResponse(received, expectedResponse) {
    const pass = received.success === expectedResponse.success &&
      this.equals(received.data, expectedResponse.data);
    
    if (pass) {
      return {
        message: () => `expected API response not to be ${this.utils.printExpected(expectedResponse)}`,
        pass: true,
      };
    } else {
      return {
        message: () => `expected API response to be ${this.utils.printExpected(expectedResponse)}, but got ${this.utils.printReceived(received)}`,
        pass: false,
      };
    }
  },
  
  toHaveErrorHandling(received, expectedError) {
    const pass = received.error === expectedError ||
      (received.error && received.error.message === expectedError);
    
    if (pass) {
      return {
        message: () => `expected error handling not to be ${this.utils.printExpected(expectedError)}`,
        pass: true,
      };
    } else {
      return {
        message: () => `expected error handling to be ${this.utils.printExpected(expectedError)}, but got ${this.utils.printReceived(received)}`,
        pass: false,
      };
    }
  },
  
  toHaveSecurityValidation(received, expectedSecurity) {
    const pass = received.isSecure === expectedSecurity.isSecure &&
      received.hasEncryption === expectedSecurity.hasEncryption;
    
    if (pass) {
      return {
        message: () => `expected security validation not to be ${this.utils.printExpected(expectedSecurity)}`,
        pass: true,
      };
    } else {
      return {
        message: () => `expected security validation to be ${this.utils.printExpected(expectedSecurity)}, but got ${this.utils.printReceived(received)}`,
        pass: false,
      };
    }
  },
});

// Extend Jest matchers
declare global {
  namespace jest {
    interface Matchers<R> {
      toHaveReduxState(expectedState: any): R;
      toHaveReduxAction(expectedAction: any): R;
      toHaveNavigationCall(expectedNavigation: any): R;
      toHaveFormValidation(expectedValidation: any): R;
      toHaveCurrencyFormat(expectedFormat: string): R;
      toHaveTransactionStatus(expectedStatus: string): R;
      toHaveWalletBalance(expectedBalance: any): R;
      toHaveAPIResponse(expectedResponse: any): R;
      toHaveErrorHandling(expectedError: string): R;
      toHaveSecurityValidation(expectedSecurity: any): R;
    }
  }
}

export {};
