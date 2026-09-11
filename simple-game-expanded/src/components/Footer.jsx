import "./Footer.css";

export default function Footer({ githubUrl = "https://github.com/HenriqueDrago/simple-game" }) {
    return (
        <footer className="app-footer">
            <a
                href={githubUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="footer-github-link"
            >
                GitHub
            </a>
        </footer>
    );
}