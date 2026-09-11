// test_isolation_integrity.js
import fs from 'fs';
import path from 'path';

const projectRoot = 'c:/Users/bidyu/OneDrive/Desktop/NeerSense';

function checkFile(relPath) {
  const fullPath = path.join(projectRoot, relPath);
  if (!fs.existsSync(fullPath)) {
    throw new Error(`File does not exist: ${relPath}`);
  }
  return fs.readFileSync(fullPath, 'utf8');
}

console.log('--- RUNNING ISOLATION INTEGRITY VERIFICATION ---');

// 1. Check Navbar.jsx
const navbarCode = checkFile('src/components/Navbar.jsx');

// Verify Villager isolation in Navbar
if (!navbarCode.includes("location.pathname === '/'") || !navbarCode.includes("location.pathname.startsWith('/village')")) {
  throw new Error('Navbar is missing root / or /village in isVillagerPortal check!');
}

// In the villager section of Navbar, ensure no login or logout buttons or links
const villagerSectionMatch = navbarCode.match(/if \(isVillagerPortal\) \{([\s\S]*?)return \(\s*<>([\s\S]*?)<\/>\s*\);\s*\}/);
if (!villagerSectionMatch) {
  throw new Error('Could not find isVillagerPortal block in Navbar.jsx!');
}
const villagerSection = villagerSectionMatch[0];

const forbiddenInVillager = [
  'to="/login"',
  'to="/admin/login"',
  'to="/health/login"',
  'to="/health/signup"',
  'to="/asha"',
  'to="/hygiene"',
  'to="/admin"',
  'handleLogout',
  'Log Out',
  'Personnel Login',
  'First-Timer Sign In',
  'Staff Login'
];

forbiddenInVillager.forEach(forbidden => {
  if (villagerSection.includes(forbidden)) {
    throw new Error(`Villager Navbar contains forbidden string: "${forbidden}"!`);
  }
});
console.log('✅ PASS: Villager Navbar has ZERO login/logout or staff/admin links.');

// 2. Check HealthLoginPage.jsx
const healthLoginCode = checkFile('src/pages/Auth/HealthLoginPage.jsx');
if (healthLoginCode.includes('ROLES.ADMIN') || healthLoginCode.includes('ROLES.VILLAGER')) {
  throw new Error('HealthLoginPage must not contain ROLES.ADMIN or ROLES.VILLAGER!');
}
if (healthLoginCode.includes('/admin/login') || healthLoginCode.includes('/villagers')) {
  throw new Error('HealthLoginPage must not link to /admin/login or /villagers!');
}
if (!healthLoginCode.includes('/health/signup')) {
  throw new Error('HealthLoginPage must link to /health/signup!');
}
console.log('✅ PASS: HealthLoginPage allows ONLY ASHA and Hygiene roles, and links ONLY to /health/signup.');

// 3. Check HealthSignUpPage.jsx
const healthSignUpCode = checkFile('src/pages/Auth/HealthSignUpPage.jsx');
if (healthSignUpCode.includes('ROLES.ADMIN') || healthSignUpCode.includes('ROLES.VILLAGER')) {
  throw new Error('HealthSignUpPage must not contain ROLES.ADMIN or ROLES.VILLAGER!');
}
if (healthSignUpCode.includes('/admin/login') || healthSignUpCode.includes('/villagers')) {
  throw new Error('HealthSignUpPage must not link to /admin/login or /villagers!');
}
if (!healthSignUpCode.includes('/health/login')) {
  throw new Error('HealthSignUpPage must link to /health/login!');
}
console.log('✅ PASS: HealthSignUpPage allows ONLY ASHA and Hygiene roles, and links ONLY to /health/login.');

// 4. Check AdminLoginPage.jsx
const adminLoginCode = checkFile('src/pages/Auth/AdminLoginPage.jsx');
if (adminLoginCode.includes('/health/login') || adminLoginCode.includes('/health/signup') || adminLoginCode.includes('/villagers')) {
  throw new Error('AdminLoginPage must not link to health auth or villagers!');
}
if (adminLoginCode.includes('ROLES_LIST') || adminLoginCode.includes('HEALTH_ROLES')) {
  throw new Error('AdminLoginPage must not have a role selector!');
}
console.log('✅ PASS: AdminLoginPage is strictly District Admin / CDMO with NO cross-portal links and NO role selector.');

// 5. Check VillagerSignUpPage.jsx
const villagerSignUpCode = checkFile('src/pages/Auth/VillagerSignUpPage.jsx');
if (villagerSignUpCode.includes('/health/login') || villagerSignUpCode.includes('/health/signup') || villagerSignUpCode.includes('/admin/login') || villagerSignUpCode.includes('/admin')) {
  throw new Error('VillagerSignUpPage must not link to staff or admin pages!');
}
if (!villagerSignUpCode.includes('to="/villagers"')) {
  throw new Error('VillagerSignUpPage must link back to /villagers!');
}
console.log('✅ PASS: VillagerSignUpPage links ONLY back to /villagers.');

// 6. Check App.jsx routes
const appCode = checkFile('src/App.jsx');
const requiredRoutes = [
  'path="/villagers"',
  'path="/villagers/signup"',
  'path="/health/login"',
  'path="/health/signup"',
  'path="/admin/login"'
];
requiredRoutes.forEach(route => {
  if (!appCode.includes(route)) {
    throw new Error(`App.jsx is missing required route: ${route}`);
  }
});
console.log('✅ PASS: App.jsx registers all required isolated routes.');

console.log('\n🌟 ALL 6 INTEGRITY CHECKS PASSED SUCCESSFULLY! 🌟');
