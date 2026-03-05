const Footer = () => {
  return (
    <footer className="border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950">
      <div className="max-w-[1920px] min-w-[1024px] mx-auto px-6 py-4 text-center text-sm text-gray-500 dark:text-gray-400">
        © {new Date().getFullYear()} Note. All rights reserved.
      </div>
    </footer>
  );
};

export default Footer;
