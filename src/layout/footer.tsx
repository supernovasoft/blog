
const Footer = () => {
    return (
        <footer className="h-16 text-center py-4 mt-5 text-gray-600 dark:text-gray-400 border-t border-gray-200 dark:border-gray-700">
            <p className="text-sm">
                &copy; {new Date().getFullYear()} Technology and Thoughts | Supernova Software
            </p>
        </footer>
    );
};

export default Footer;