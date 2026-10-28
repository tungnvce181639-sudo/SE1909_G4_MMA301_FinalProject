/**
 * Script to print Expo Go redirect URIs for Google OAuth configuration
 * Run with: node get-redirect-uri.js
 */

console.log('====================================');
console.log('Expo Go Redirect URIs for Google OAuth:');
console.log('====================================');
console.log('\nFor local development (localhost):');
console.log('exp://localhost:19000/--/');
console.log('\nFor network development (replace with your IP):');
console.log('exp://192.168.x.x:19000/--/');
console.log('\nFor Expo Snack/Go:');
console.log('exp://exp.host/@username/smartcampus-market/--/');
console.log('====================================');
console.log('\nAdd these URIs to Google Console:');
console.log('https://console.cloud.google.com/apis/credentials');
console.log('\nNavigate to your OAuth 2.0 Client ID:');
console.log('225538325402-6a97hnmepk3uj9maavgqb438i681emae.apps.googleusercontent.com');
console.log('\nAdd the URIs to "Authorized redirect URIs"');
console.log('====================================');
console.log('\nNote: When you run "npx expo start --go", check the terminal');
console.log('for the actual redirect URI being used by Expo Go.');
console.log('====================================');
