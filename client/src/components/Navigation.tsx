import { Link, useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Scale, User, Globe, LogOut, Settings } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTranslations } from '@/lib/i18n';

export function Navigation() {
  const { user, logout } = useAuth();
  const { language, setLanguage } = useLanguage();
  const t = useTranslations(language);
  const [location] = useLocation();

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  if (!user) return null;

  return (
    <nav className="bg-white border-b border-gray-200 px-4 py-3 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Logo */}
        <Link href="/dashboard" className="flex items-center gap-2 hover:opacity-80">
          <Scale className="h-8 w-8 text-blue-600" />
          <span className="text-xl font-bold text-gray-900">LeFriAI</span>
        </Link>

        {/* Navigation Links */}
        <div className="hidden md:flex items-center gap-6">
          <Link href="/dashboard">
            <Button 
              variant={location === '/dashboard' ? 'default' : 'ghost'}
              className="bg-white hover:bg-gray-50 text-gray-700 border border-gray-200"
            >
              {t.dashboard}
            </Button>
          </Link>
          <Link href="/consulta">
            <Button 
              variant={location === '/consulta' ? 'default' : 'ghost'}
              className="bg-white hover:bg-gray-50 text-gray-700 border border-gray-200"
            >
              {t.consultation}
            </Button>
          </Link>
          <Link href="/processes">
            <Button 
              variant={location === '/processes' ? 'default' : 'ghost'}
              className="bg-white hover:bg-gray-50 text-gray-700 border border-gray-200"
            >
              {t.processes}
            </Button>
          </Link>
          <Link href="/emergencia">
            <Button 
              variant={location === '/emergencia' ? 'default' : 'ghost'}
              className="bg-white hover:bg-gray-50 text-gray-700 border border-gray-200"
            >
              {t.emergency}
            </Button>
          </Link>
        </div>

        {/* Right Side Controls */}
        <div className="flex items-center gap-4">
          {/* Language Selector */}
          <Select value={language} onValueChange={setLanguage}>
            <SelectTrigger className="w-32 bg-white border-gray-200">
              <Globe className="h-4 w-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-white border-gray-200">
              <SelectItem value="en">English</SelectItem>
              <SelectItem value="es">Español</SelectItem>
            </SelectContent>
          </Select>

          {/* Profile Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="bg-white hover:bg-gray-50 border border-gray-200">
                <User className="h-4 w-4 mr-2" />
                {user.name || user.email}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="bg-white border-gray-200" align="end">
              <DropdownMenuItem asChild>
                <Link href="/profile" className="flex items-center cursor-pointer">
                  <Settings className="h-4 w-4 mr-2" />
                  {t.profile}
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleLogout} className="flex items-center cursor-pointer">
                <LogOut className="h-4 w-4 mr-2" />
                {t.logout}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Mobile Navigation */}
      <div className="md:hidden mt-3 flex gap-2 overflow-x-auto">
        <Link href="/dashboard">
          <Button 
            variant={location === '/dashboard' ? 'default' : 'ghost'}
            size="sm"
            className="bg-white hover:bg-gray-50 text-gray-700 border border-gray-200 whitespace-nowrap"
          >
            {t.dashboard}
          </Button>
        </Link>
        <Link href="/consulta">
          <Button 
            variant={location === '/consulta' ? 'default' : 'ghost'}
            size="sm"
            className="bg-white hover:bg-gray-50 text-gray-700 border border-gray-200 whitespace-nowrap"
          >
            {t.consultation}
          </Button>
        </Link>
        <Link href="/processes">
          <Button 
            variant={location === '/processes' ? 'default' : 'ghost'}
            size="sm"
            className="bg-white hover:bg-gray-50 text-gray-700 border border-gray-200 whitespace-nowrap"
          >
            {t.processes}
          </Button>
        </Link>
        <Link href="/emergencia">
          <Button 
            variant={location === '/emergencia' ? 'default' : 'ghost'}
            size="sm"
            className="bg-white hover:bg-gray-50 text-gray-700 border border-gray-200 whitespace-nowrap"
          >
            {t.emergency}
          </Button>
        </Link>
      </div>
    </nav>
  );
}