export default function WhatsAppButton() {
    return (
        <a
            href="https://wa.me/59176012345"
            target="_blank"
            className="fixed bottom-8 right-8 z-50 bg-whatsapp text-white p-4 rounded-full shadow-xl hover:scale-110 transition-transform flex items-center justify-center"
        >
            <svg
                className="w-8 h-8 fill-current"
                viewBox="0 0 448 512"
                xmlns="http://www.w3.org/2000/svg"
            >
                <path d="M92.1 390.6c-15-15.1-32.1-28.2-50.5-39.1L0 448l99.5-26.7c15.2 8.1 31.2 12.4 47.4 12.4 5.4 0 10.8-.4 16.2-1.2-13.1-13.1-23.5-28-31-41.9zM448 176c0-97.2-100.3-176-224-176S0 78.8 0 176c0 42.4 19.1 81 50.7 111.4l-14.4 38.6c-1.1 2.9-.4 6.2 1.8 8.4s5.4 3.1 8.4 2.1l42.3-11.3c23.5 10.8 49.3 16.8 76.5 16.8 2.7 0 5.4-.1 8.1-.2-1.3-7.5-2.1-15.3-2.1-23.1 0-80.8 79.1-146.3 176.7-146.3 7.8 0 15.6.4 23.3 1.2.1-2.6.2-5.3.2-8zm-88.7 88.7c-9.4 9.4-9.4 24.6 0 33.9s24.6 9.4 33.9 0c9.4-9.4 9.4-24.6 0-33.9s-24.6-9.4-33.9 0z" />
            </svg>
        </a>
    );
}