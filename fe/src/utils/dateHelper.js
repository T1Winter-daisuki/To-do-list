export const sameDay = (d1, d2) => {
    return d1.getFullYear() === d2.getFullYear() &&
           d1.getMonth() === d2.getMonth() &&
           d1.getDate() === d2.getDate();
};

export const Tomorrow = (day) => {
    const today = new Date();
    const tomorrow = new Date(today);
    
    tomorrow.setDate(today.getDate()+1);
    
    return sameDay(day, tomorrow);
};

export const ThisWeek = (day) => {
    const today = new Date();
    
    const mon = new Date(today.setDate(day.getDate() - day.getDay()));
    const sun = new Date(today.setDate(day.getDate() - day.getDay()+6));
    
    return day >= mon && day <= sun;
};

export const outOfDate = (deadline) => {
    if (!deadline) return false;
    return new Date() > new Date(deadline);
};

export const toLocalISOString = (date) => {
    if (!date) return '';
    const d = new Date(date);

    if (isNaN(d.getTime())) return '';
    const offset = d.getTimezoneOffset() * 60000;
    
    return (new Date(d.getTime() - offset)).toISOString().slice(0, 16);
};

export const formatDateTime = (isoString) => {
    if (!isoString) 
        return 'Không thời hạn';
    
    const date = new Date(isoString);
    
    return date.toLocaleDateString('vi-VN', { 
        day: '2-digit', 
        month: '2-digit' 
    }) + ' ' + date.toLocaleTimeString('vi-VN', { 
        hour: '2-digit', 
        minute: '2-digit', 
        hour12: false 
    });
};