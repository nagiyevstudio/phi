import type { Plugin } from 'vite';
import * as fs from 'fs';
import * as path from 'path';
import { createRequire } from 'module';

// Динамический импорт для CommonJS модуля в ESM окружении
const require = createRequire(import.meta.url);
const FtpDeploy = require('ftp-deploy');

interface FtpConfig {
  host: string;
  user: string;
  password: string;
  port?: number;
  localRoot?: string;
  remoteRoot?: string;
  include?: string[];
  exclude?: string[];
  deleteRemote?: boolean;
  forcePasv?: boolean;
  sftp?: boolean;
  secure?: boolean;
  secureOptions?: {
    rejectUnauthorized?: boolean;
  };
}

export function vitePluginFtp(configPath: string = './ftp-config.json'): Plugin {
  return {
    name: 'vite-plugin-ftp',
    apply: 'build',
    closeBundle: {
      sequential: true,
      async handler() {
        const configFile = path.resolve(process.cwd(), configPath);
        
        if (!fs.existsSync(configFile)) {
          console.warn(`⚠️  FTP config file not found: ${configPath}. Skipping FTP upload.`);
          return;
        }

        try {
          const config: FtpConfig = JSON.parse(fs.readFileSync(configFile, 'utf-8'));
          
          if (!config.host || !config.user || !config.password) {
            console.warn('⚠️  FTP config is incomplete. Skipping FTP upload.');
            return;
          }

          const ftpDeploy = new FtpDeploy();
          
          const deployConfig: any = {
            user: config.user,
            password: config.password,
            host: config.host,
            port: config.port || 21,
            localRoot: config.localRoot || './dist',
            remoteRoot: config.remoteRoot || '/',
            include: config.include || ['*', '**/*'],
            exclude: config.exclude || ['.git/**', '.gitignore', '.DS_Store', 'node_modules/**'],
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

          console.log('🚀 Starting FTP upload...');
          
          try {
            const res = await ftpDeploy.deploy(deployConfig);
            console.log('✅ FTP upload completed successfully!');
            console.log(`📤 Uploaded ${res.length} files`);
          } catch (err) {
            console.error('❌ FTP upload failed:', err);
            process.exit(1);
          }
        } catch (error) {
          console.error('❌ Error reading FTP config:', error);
        }
      },
    },
  };
}

