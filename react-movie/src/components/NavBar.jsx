import { Link } from 'react-router-dom'
import { useSearchContext } from '../contexts/SearchContext'
import "../css/NavBar.css"
import { useEffect } from 'react'
import Burger from '../components/Burger'



function NavBar() {

    const { searchName, setSearchName, handleSearch, setIsSearchingSeries, isSearchingSeries,  } = useSearchContext()

    useEffect(() => {
        
    })

    return (
        <div>
            <div className="navbar flex flex-row bg-gradient-to-b from-neutral-950 to-neutral-900 px-[4rem] p-[1rem] items-center justify-between gap-10">
                <div className="navbar-brand flex flex-row items-center gap-10">
                    <Link to="/" className='font-bold text-3xl'>Streaming Hub</Link>
                    <div className="navbar-link flex flex-row gap-4 text-sm">
                        <Link to="/" className="nav-link">Home</Link>
                        <Link to="/series" className='nav-link'>Serie tv</Link>
                        {/* <Link to="/favorites" className="nav-link">Preferiti</Link> */}
                    </div>
                </div>

                {/* Burger menu - visible on small screens */}
                <div className="navbar-burger">
                  <Burger />
                </div>

                <form onSubmit={handleSearch} className="search-form">   
                    <label htmlFor="search" className="block mb-2.5 text-sm font-medium text-heading sr-only">Cerca...</label>
                        <div className="relative">
                            <div className="absolute inset-y-0 start-0 flex items-center ps-3 pointer-events-none">
                                <svg className="w-4 h-4 text-body" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24"><path stroke="currentColor" strokeLinecap="round" strokeWidth="2" d="m21 21-3.5-3.5M17 10a7 7 0 1 1-14 0 7 7 0 0 1 14 0Z"/></svg>
                            </div>
                            <input type="search" id="search" className="rounded-lg block w-80 p-3 ps-9 bg-neutral-secondary-medium border border-default-medium text-heading text-sm rounded-base focus:ring-brand focus:border-brand shadow-xs placeholder:text-body" placeholder="Cerca..." required 
                            value={searchName}
                            onChange={(e) => setSearchName(e.target.value)} />
                        </div>
                    </form>
            </div>
        </div>
    )
}

export default NavBar