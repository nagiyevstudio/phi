const fs = require('fs');
const path = require('path');

// Ищем ftp-deploy в корне проекта или в frontend/node_modules
const rootDir = path.resolve(__dirname, '..');
const localNodeModules = path.join(__dirname, 'node_modules');
const rootNodeModules = path.join(rootDir, 'node_modules');
const frontendNodeModules = path.join(rootDir, 'frontend', 'node_modules');

let FtpDeploy;
try {
  // Сначала пробуем найти в frontend/node_modules (там точно установлен)
  if (fs.existsSync(path.join(frontendNodeModules, 'ftp-deploy'))) {
    const modulePath = path.join(frontendNodeModules, 'ftp-deploy');
    FtpDeploy = require(modulePath);
  } 
  // Затем в корне проекта
  else if (fs.existsSync(path.join(rootNodeModules, 'ftp-deploy'))) {
    const modulePath = path.join(rootNodeModules, 'ftp-deploy');
    FtpDeploy = require(modulePath);
  } 
  // Затем в локальной директории
  else if (fs.existsSync(path.join(localNodeModules, 'ftp-deploy'))) {
    const modulePath = path.join(localNodeModules, 'ftp-deploy');
    FtpDeploy = require(modulePath);
  } 
  // Или используем стандартный require
  else {
    FtpDeploy = require('ftp-deploy');
  }
} catch (err) {
  console.error('❌ Error loading ftp-deploy module:', err.message);
  console.error('Please run: npm install ftp-deploy');
  process.exit(1);
}

const configCandidates = [
  path.resolve(rootDir, 'secrets', 'ftp.json'),
  path.resolve(__dirname, 'ftp-config.json'),
];
const configFile = configCandidates.find((candidate) => fs.existsSync(candidate));

if (!configFile) {
  console.warn('⚠️  FTP config file not found. Skipping FTP upload.');
  process.exit(0);
}

try {
  const rawConfig = JSON.parse(fs.readFileSync(configFile, 'utf-8'));
  const config = rawConfig && rawConfig.backend ? rawConfig.backend : rawConfig;
  
  if (!config.host || !config.user || !config.password) {
    console.warn('⚠️  FTP config is incomplete. Skipping FTP upload.');
    process.exit(0);
  }

  const ftpDeploy = new FtpDeploy();
  
  const baseExclude = [
    '.git/**',
    '.gitignore',
    '.DS_Store',
    'node_modules/**',
    'vendor/**',
    '.env',
    'deploy.js',
    'ftp-config.example.json',
    'config-example.txt',
    'error.log',
    'test-connection.php',
  ];

  const deployConfig = {
    user: config.user,
    password: config.password,
    host: config.host,
    port: config.port || 21,
    localRoot: path.resolve(__dirname, config.localRoot || '.'),
    remoteRoot: config.remoteRoot || '/',
    include: config.include || ['*', '**/*'],
    exclude: Array.from(new Set([...baseExclude, ...(config.exclude || [])])),
    deleteRemote: config.deleteRemote || false,
    forcePasv: config.forcePasv !== false,
    sftp: config.sftp || false,
  };

  // Добавляем поддержку FTPS (FTP over SSL)
  if (config.secure) {
    deployConfig.secure = true;
    if (config.secureOptions) {
      deployConfig.secureOptions = config.secureOptions;
    }
  }

  console.log('🚀 Starting backend FTP upload...');
  console.log(`📁 Local: ${deployConfig.localRoot}`);
  console.log(`🌐 Remote: ${deployConfig.remoteRoot}`);
  
  ftpDeploy
    .deploy(deployConfig)
    .then((res) => {
      console.log('✅ Backend FTP upload completed successfully!');
      console.log(`📤 Uploaded ${res.length} files`);
    })
    .catch((err) => {
      console.error('❌ Backend FTP upload failed:', err);
      process.exit(1);
    });
} catch (error) {
  console.error('❌ Error reading FTP config:', error);
  process.exit(1);
}
