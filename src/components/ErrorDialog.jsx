import React from 'react';
import { motion } from 'framer-motion';

function ErrorDialog({ error, onClose }) {
    const getErrorMessage = (error) => {
        // If error is a string, return it directly
        if (typeof error === 'string') {
            return error;
        }

        // If error has a message property, use it
        if (error.message) {
            return error.message;
        }

        // Handle Firebase error codes
        switch (error.code) {
            // Authentication Errors
            case 'auth/email-already-in-use':
                return 'This email is already registered. Please use a different email or try logging in.';
            case 'auth/invalid-email':
                return 'Please enter a valid email address.';
            case 'auth/operation-not-allowed':
                return 'This operation is not allowed. Please contact support.';
            case 'auth/weak-password':
                return 'Password should be at least 6 characters long. Please choose a stronger password.';
            case 'auth/user-disabled':
                return 'This account has been disabled. Please contact support.';
            case 'auth/user-not-found':
                return 'No account found with this email. Please check your email or sign up.';
            case 'auth/wrong-password':
                return 'Incorrect password. Please try again.';
            case 'auth/missing-credentials':
                return 'Please fill in all required fields.';
            case 'auth/too-many-requests':
                return 'Too many failed attempts. Please try again later.';
            case 'auth/network-request-failed':
                return 'Network error. Please check your internet connection.';
            case 'auth/popup-closed-by-user':
                return 'Sign-in popup was closed before completing the sign-in process.';
            case 'auth/popup-blocked':
                return 'Sign-in popup was blocked by the browser. Please allow popups for this site.';
            case 'auth/cancelled-popup-request':
                return 'Another sign-in attempt was made before the previous one completed.';
            case 'auth/account-exists-with-different-credential':
                return 'An account already exists with the same email address but different sign-in credentials.';
            case 'auth/credential-already-in-use':
                return 'This credential is already associated with a different user account.';
            case 'auth/invalid-credential':
                return 'The credential is invalid or has expired.';
            case 'auth/invalid-verification-code':
                return 'The verification code is invalid.';
            case 'auth/invalid-verification-id':
                return 'The verification ID is invalid.';
            case 'auth/missing-verification-code':
                return 'The verification code is missing.';
            case 'auth/missing-verification-id':
                return 'The verification ID is missing.';
            case 'auth/phone-number-already-exists':
                return 'This phone number is already registered. Please use a different number.';
            case 'auth/invalid-phone-number':
                return 'Please enter a valid phone number.';
            case 'auth/missing-phone-number':
                return 'Phone number is required.';
            case 'auth/missing-email':
                return 'Email is required.';
            case 'auth/missing-password':
                return 'Password is required.';
            case 'auth/invalid-api-key':
                return 'The API key is invalid. Please contact support.';
            case 'auth/app-not-authorized':
                return 'This app is not authorized to use Firebase Authentication.';
            case 'auth/expired-action-code':
                return 'The action code has expired. Please try again.';
            case 'auth/invalid-action-code':
                return 'The action code is invalid. Please try again.';
            case 'auth/requires-recent-login':
                return 'This operation requires a recent login. Please log in again.';
            case 'auth/unauthorized-domain':
                return 'This domain is not authorized for Firebase Authentication.';
            case 'auth/unsupported-persistence-type':
                return 'The specified persistence type is not supported.';
            case 'auth/invalid-persistence-type':
                return 'The specified persistence type is invalid.';
            case 'auth/unsupported-tenant-operation':
                return 'This operation is not supported in a multi-tenant context.';
            case 'auth/invalid-tenant-id':
                return 'The tenant ID is invalid.';
            case 'auth/tenant-id-mismatch':
                return 'The tenant ID does not match the current user.';
            case 'auth/unsupported-first-factor':
                return 'The first factor is not supported.';
            case 'auth/unsupported-second-factor':
                return 'The second factor is not supported.';
            case 'auth/second-factor-already-in-use':
                return 'The second factor is already in use.';
            case 'auth/maximum-second-factor-count-exceeded':
                return 'The maximum number of second factors has been exceeded.';
            case 'auth/unsupported-provider':
                return 'The provider is not supported.';
            case 'auth/invalid-provider-id':
                return 'The provider ID is invalid.';
            case 'auth/invalid-oauth-provider':
                return 'The OAuth provider is invalid.';
            case 'auth/invalid-oauth-client-id':
                return 'The OAuth client ID is invalid.';
            case 'auth/invalid-oauth-access-token':
                return 'The OAuth access token is invalid.';
            case 'auth/invalid-oauth-refresh-token':
                return 'The OAuth refresh token is invalid.';
            case 'auth/invalid-oauth-scope':
                return 'The OAuth scope is invalid.';
            case 'auth/invalid-oauth-state':
                return 'The OAuth state is invalid.';
            case 'auth/invalid-oauth-code':
                return 'The OAuth code is invalid.';
            case 'auth/invalid-oauth-verifier':
                return 'The OAuth verifier is invalid.';
            case 'auth/invalid-oauth-nonce':
                return 'The OAuth nonce is invalid.';
            case 'auth/invalid-oauth-redirect-uri':
                return 'The OAuth redirect URI is invalid.';
            case 'auth/invalid-oauth-response-type':
                return 'The OAuth response type is invalid.';
            case 'auth/invalid-oauth-grant-type':
                return 'The OAuth grant type is invalid.';
            case 'auth/invalid-oauth-token':
                return 'The OAuth token is invalid.';
            case 'auth/invalid-oauth-token-secret':
                return 'The OAuth token secret is invalid.';
            case 'auth/invalid-oauth-request-token':
                return 'The OAuth request token is invalid.';
            case 'auth/invalid-oauth-request-token-secret':
                return 'The OAuth request token secret is invalid.';
            case 'auth/invalid-oauth-request-token-verifier':
                return 'The OAuth request token verifier is invalid.';
            case 'auth/invalid-oauth-request-token-nonce':
                return 'The OAuth request token nonce is invalid.';
            case 'auth/invalid-oauth-request-token-timestamp':
                return 'The OAuth request token timestamp is invalid.';
            case 'auth/invalid-oauth-request-token-signature':
                return 'The OAuth request token signature is invalid.';
            case 'auth/invalid-oauth-request-token-signature-method':
                return 'The OAuth request token signature method is invalid.';
            case 'auth/invalid-oauth-request-token-callback':
                return 'The OAuth request token callback is invalid.';
            case 'auth/invalid-oauth-request-token-version':
                return 'The OAuth request token version is invalid.';
            case 'auth/invalid-oauth-request-token-realm':
                return 'The OAuth request token realm is invalid.';
            case 'auth/invalid-oauth-request-token-domain':
                return 'The OAuth request token domain is invalid.';
            default:
                return error.message || 'An error occurred. Please try again.';
        }
    };

    return (
        <motion.div
            className="error-dialog-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
        >
            <motion.div
                className="error-dialog"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
            >
                <div className="error-dialog-content">
                    <div className="error-icon">⚠️</div>
                    <h3>Error</h3>
                    <p>{getErrorMessage(error)}</p>
                    <button className="error-dialog-button" onClick={onClose}>
                        Close
                    </button>
                </div>
            </motion.div>
        </motion.div>
    );
}

export default ErrorDialog; 