import React, { useRef, useState, useMemo, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import styles from './Calendar.module.css';

const CalendarView = () => {
    const { tasks, searchQuery, Popup, setDetailTask, selectedDate, setSelectedDate, setActiveStartDate } = useOutletContext();
    const calendarRef = useRef(null);
    const [viewMode, setViewMode] = useState('timeGridWeek');
    const [viewRange, setViewRange] = useState({ start: null, end: null });

    // 1. Map dữ liệu tasks sang event của Calendar + Thêm màu sắc
    const calendarEvents = useMemo(() => {
        let filteredTasks = tasks || [];
        if (searchQuery) {
            filteredTasks = filteredTasks.filter(t => t.title.toLowerCase().includes(searchQuery.toLowerCase()));
        }

        const now = new Date();

        return filteredTasks.map(task => {
            let bgColor = '#FBF3D1';
            if (task.is_completed) {
                bgColor = '#d4edda';
            } else if (task.deadline && new Date(task.deadline) < now) {
                bgColor = '#f8d7da';
            }

            return {
                id: task.id,
                title: task.title,
                start: task.start_time || task.deadline,
                end: task.deadline,
                backgroundColor: bgColor,
                borderColor: 'rgba(0,0,0,0.05)',
                textColor: '#444',
                extendedProps: { ...task }
            };
        });
    }, [tasks, searchQuery]);

    // cnt tasks theo dạng
    const currentViewTaskCount = useMemo(() => {
        if (!viewRange.start || !viewRange.end) return 0;
        return calendarEvents.filter(event => {
            if (!event.start) return false;
            const eventStart = new Date(event.start);
            return eventStart >= viewRange.start && eventStart < viewRange.end;
        }).length;
    }, [calendarEvents, viewRange]);

    // D/W/M
    const handleViewChange = (e) => {
        const newView = e.target.value;
        setViewMode(newView);
        if (calendarRef.current) {
            calendarRef.current.getApi().changeView(newView);
        }
    };

    // kéo thả chuột tạo Task mới
    const handleDateSelect = (selectInfo) => {
        Popup(selectInfo.start, selectInfo.end);
        selectInfo.view.calendar.unselect(); 
    };
    useEffect(() => {
        if (calendarRef.current && selectedDate) {
            let calendarApi = calendarRef.current.getApi();
            calendarApi.gotoDate(selectedDate);
        }
    }, [selectedDate]);

    return (
        <div className={styles.calendarWrapper}>
            <div className={styles.mainHeader}>

                <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                    <select 
                        value={viewMode} 
                        onChange={handleViewChange}
                        className={styles.pageTitleSelect}
                    >
                        <option value="timeGridDay">Theo Ngày</option>
                        <option value="timeGridWeek">Theo Tuần</option>
                        <option value="dayGridMonth">Theo Tháng</option>
                    </select>
                    
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                        <button 
                            onClick={() => {
                                const today = new Date();
                                setSelectedDate(today);
                                calendarRef.current.getApi().today();
                            }} 
                            className={styles.pageBtn}
                            style={{ padding: '0 12px', fontWeight: '600' }}
                        >
                            Hôm nay
                        </button>
                        <button onClick={() => calendarRef.current.getApi().prev()} className={styles.pageBtn}>◀</button>
                        <button onClick={() => calendarRef.current.getApi().next()} className={styles.pageBtn}>▶</button>
                    </div>
                </div>
                
                {/* BÊN PHẢI: Số lượng Tasks */}
                <span className={styles.taskCount}>
                    {currentViewTaskCount} {currentViewTaskCount <= 1 ? 'Task' : 'Tasks'}
                </span>
            </div>

            {/* Lịch chính */}
            <div className={styles.calendarBody}>
                <FullCalendar
                    ref={calendarRef}
                    plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
                    initialView={viewMode}
                    headerToolbar={false}
                    events={calendarEvents}
                    
                    // Kéo thả & Click
                    selectable={true}
                    selectMirror={true}
                    select={handleDateSelect}
                    eventClick={(info) => {
                        setDetailTask(info.event.extendedProps);
                    }}
                    
                    slotMinTime="00:00:00"
                    slotMaxTime="23:59:00"
                    allDaySlot={false}
                    contentHeight="auto"
                    height="100%"
                    locale="vi"

                    datesSet={(dateInfo) => {
                        if (calendarRef.current && setActiveStartDate) {
                            setActiveStartDate(calendarRef.current.getApi().getDate());
                        }
                        setViewRange({ start: dateInfo.start, end: dateInfo.end }); 
                    }}
                />
            </div>
        </div>
    );
};

export default CalendarView;