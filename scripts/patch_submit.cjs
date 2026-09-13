const fs = require('fs');
const path = require('path');

const filePath = path.resolve('src/pages/Auth/FirstTimeSignInPage.jsx');
let content = fs.readFileSync(filePath, 'utf8');

// Fix 1: Fix the doubled (( from the first bad replacement
content = content.replace(
  '!(selectedRole === ROLES.ADMIN && adminAlreadyRegistered) && ( (',
  '!(selectedRole === ROLES.ADMIN && adminAlreadyRegistered) && ('
);

// Fix 2: Update className to support dynamic admin vs other styling
content = content.replace(
  'className="w-full py-3.5 px-4 bg-gradient-to-r from-sky-600 to-cyan-600 hover:from-sky-700 hover:to-cyan-700 disabled:opacity-50 text-white font-bold rounded-xl text-sm transition shadow-lg shadow-sky-600/25 flex items-center justify-center gap-2 cursor-pointer mt-4"',
  'className={`w-full py-3.5 px-4 disabled:opacity-50 text-white font-bold rounded-xl text-sm transition shadow-lg flex items-center justify-center gap-2 cursor-pointer mt-4 ${selectedRole === ROLES.ADMIN ? "bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 shadow-indigo-600/25" : "bg-gradient-to-r from-sky-600 to-cyan-600 hover:from-sky-700 hover:to-cyan-700 shadow-sky-600/25"}`}'
);

fs.writeFileSync(filePath, content, 'utf8');
console.log('Done! File patched successfully.');
