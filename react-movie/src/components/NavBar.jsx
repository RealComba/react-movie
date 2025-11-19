import { Link } from 'react-router-dom'
import { useSearchContext } from '../contexts/SearchContext'
import "../css/NavBar.css"

function NavBar() {

    const { searchName, setSearchName, handleSearch, setIsSearchingSeries } = useSearchContext()

    return (
        <div>
            <div className="navbar flex flex-row bg-gradient-to-b from-neutral-950 to-neutral-900 px-[4rem] p-[1rem] items-center justify-between gap-10">
                <div className="navbar-brand flex flex-row items-center gap-10">
                    <Link to="/" className='font-bold text-3xl'>Streaming Hub</Link>
                    <div className="navbar-link flex flex-row gap-4 text-sm">
                        <Link to="/" className="nav-link">Home</Link>
                        <Link to="/series" className='nav-link'>Serie tv</Link>
                        <Link to="/favorites" className="nav-link">Preferiti</Link>
                    </div>
                </div>
                <form onSubmit={handleSearch} className="search-form flex flex-row gap-5">
                    <input 
                    type="text" 
                    placeholder="Cerca Film..." 
                    className="search-input bg-neutral-800 border-1 border-gray-500 bg-[url('/lens.svg')]"
                    value={searchName}
                    onChange={(e) => setSearchName(e.target.value)} 
                    />
                    <button type="submit" className="search-button bg-green-700 px-4 p-1 rounded-lg">Cerca</button>
                     <button type="button" onClick={() => setIsSearchingSeries(false)}>Film</button>
                    <button type="button" onClick={() => setIsSearchingSeries(true)}>Serie</button>
                </form>
            </div>
        </div>
    )
}

export default NavBar