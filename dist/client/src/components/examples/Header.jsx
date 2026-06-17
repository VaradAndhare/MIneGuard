import Header from '../Header';
import { useState } from 'react';
export default function HeaderExample() {
    const [theme, setTheme] = useState('light');
    const toggleTheme = () => {
        setTheme(prev => prev === 'light' ? 'dark' : 'light');
        console.log('Theme toggled to:', theme === 'light' ? 'dark' : 'light');
    };
    return (<Header theme={theme} onThemeToggle={toggleTheme}/>);
}
