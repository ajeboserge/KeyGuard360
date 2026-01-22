import { Amplify } from 'aws-amplify';

export const configureAmplify = () => {
    Amplify.configure({
        Auth: {
            Cognito: {
                userPoolId: 'eu-north-1_FYpZtCf7D', // Replace with your User Pool ID
                userPoolClientId: '1lk3at33d4d7d238p4eapludbn', // Updated Client ID (No Secret)
                loginWith: {
                    email: true,
                }
            }
        }
    });
};
