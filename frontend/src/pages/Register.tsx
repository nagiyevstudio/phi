import { Link } from 'react-router-dom';

export default function Register() {
  return (
    <div className="min-h-screen flex items-center justify-center pf-app-bg py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-6 text-center">
        <h2 className="text-3xl font-extrabold text-gray-900 dark:text-[#e5e7eb]">
          Регистрация закрыта
        </h2>
        <p className="text-sm text-gray-600 dark:text-[#a3a3a3]">
          Используйте существующий логин.
        </p>
        <Link
          to="/login"
          className="inline-flex items-center justify-center px-4 py-2 rounded-md text-white bg-[#d27b30] hover:bg-[#b56726]"
        >
          Перейти ко входу
        </Link>
      </div>
    </div>
  );
}

