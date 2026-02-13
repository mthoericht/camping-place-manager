import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom'
import { Tent, MapPin, Package, Calendar, BarChart3, Menu, Sun, Moon, LogOut } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { setMobileNavOpen, toggleTheme } from '@/store/uiSlice'
import { logout } from '@/store/authSlice'
import { useEffect } from 'react'
import { Sheet, SheetContent } from '@/components/ui/sheet'
import { mergeClasses } from '@/lib/utils'

const navItems = [
  { to: '/bookings', label: 'Buchungen', icon: Calendar },
  { to: '/camping-places', label: 'Stellplätze', icon: MapPin },
  { to: '/camping-items', label: 'Ausrüstung', icon: Package },
  { to: '/analytics', label: 'Analytics', icon: BarChart3 },
]

export default function Topbar() 
{
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const theme = useAppSelector((state) => state.ui.theme)
  const mobileNavOpen = useAppSelector((state) => state.ui.mobileNavOpen)
  const employee = useAppSelector((state) => state.auth.employee)
  const location = useLocation()

  useEffect(() => 
  {
    document.documentElement.classList.toggle('dark', theme === 'dark')
  }, [theme])

  const isActive = (path: string) => location.pathname.startsWith(path)

  const navLinks = (
    <nav
      className="bg-muted text-muted-foreground inline-flex h-9 w-fit items-center justify-center rounded-xl p-[3px] flex"
      role="tablist"
    >
      {navItems.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          onClick={() => dispatch(setMobileNavOpen(false))}
          role="tab"
          className={mergeClasses(
            'inline-flex h-[calc(100%-2px)] flex-1 items-center justify-center rounded-lg border px-3 py-1 text-sm font-medium whitespace-nowrap transition-colors',
            isActive(item.to)
              ? 'bg-card text-foreground border-input shadow-sm'
              : 'border-transparent text-foreground/80 hover:text-foreground hover:bg-background/50'
          )}
        >
          {item.label}
        </NavLink>
      ))}
    </nav>
  )

  return (
    <>
      <header className="sticky top-0 z-20 bg-background border-b">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between py-4">
            <Link to="/bookings" className="flex items-center gap-3 shrink-0">
              <Tent className="h-8 w-8 text-foreground" />
              <div className="hidden sm:block">
                <h1 className="text-2xl font-bold text-foreground">Campingplatz Manager</h1>
                <p className="text-sm text-muted-foreground">Verwaltung von Buchungen, Stellplätzen und Ausrüstung</p>
              </div>
            </Link>

            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" className="md:hidden" onClick={() => dispatch(setMobileNavOpen(true))}>
                <Menu className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="icon" onClick={() => dispatch(toggleTheme())}>
                {theme === 'light' ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
              </Button>
              {employee && (
                <span className="hidden sm:inline text-sm text-muted-foreground truncate max-w-[140px]" title={employee.fullName}>
                  {employee.fullName}
                </span>
              )}
              <Button variant="ghost" size="icon" onClick={() => { dispatch(logout()); navigate('/login') }}>
                <LogOut className="h-5 w-5" />
              </Button>
            </div>
          </div>
          <div className="hidden md:block pb-3">{navLinks}</div>
        </div>
      </header>

      <Sheet open={mobileNavOpen} onOpenChange={(open) => dispatch(setMobileNavOpen(open))}>
        <SheetContent side="left" className="w-64 p-0">
          <div className="p-4 border-b">
            <span className="font-semibold">Menü</span>
          </div>
          <nav className="flex flex-col p-2 gap-1">
            {navItems.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                onClick={() => dispatch(setMobileNavOpen(false))}
                className={mergeClasses(
                  'flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors',
                  isActive(item.to)
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                )}
              >
                <item.icon className="h-5 w-5 shrink-0" />
                {item.label}
              </Link>
            ))}
          </nav>
        </SheetContent>
      </Sheet>
    </>
  )
}
