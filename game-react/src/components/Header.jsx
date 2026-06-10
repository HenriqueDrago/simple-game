import './Header.css';

function Header({battleState}) {
    return (
        <div className="header-container">
            <h1 className="main-header-text">Basic RPG (React)</h1>
            {battleState == "victory" && <h2 className="win-text">You Win!</h2>}
            {battleState == "defeat" && <h2 className="lose-text">You Lose!</h2>}
            {battleState == "draw" && <h2 className="lose-text">Draw!</h2>}
        </div>
    )
}

export default Header;