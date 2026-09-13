import { NavLink } from "react-router-dom"
import { PlusIcon } from "lucide-react"
import { Button } from "@/components/ui/button"

type NavbarProps = {
  onNewEntryClick: () => void
}

export function Navbar({ onNewEntryClick }: NavbarProps) {
  return (
    <header className="flex h-16 w-full items-center justify-between bg-background px-6">
      <span className="text-base font-semibold text-foreground">Track-r</span>
      <nav className="flex items-center gap-6">
        <NavLink
          to="/"
          end
          className={({ isActive }) =>
            `text-sm font-medium ${isActive ? "text-primary" : "text-[#4A5565]"}`
          }
        >
          Dashboard
        </NavLink>
        <NavLink
          to="/projects"
          className={({ isActive }) =>
            `text-sm font-medium ${isActive ? "text-primary" : "text-[#4A5565]"}`
          }
        >
          Projects
        </NavLink>
      </nav>
      <Button size="sm" onClick={onNewEntryClick}>
        <PlusIcon />
        New Entry
      </Button>
    </header>
  )
}
