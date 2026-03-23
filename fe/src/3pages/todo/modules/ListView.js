import React, { useEffect, useState, useMemo,useCallback } from 'react';
import { useOutletContext } from 'react-router-dom';
import styles from './List.module.css';
import { sameDay, Tomorrow, ThisWeek, formatDateTime } from '../../../utils/dateHelper';

const ListView = () => {
    const { 
        tasks,searchQuery,
        justCreatedId, handleToggleComplete, setDetailTask,
        getTaskStyle, openEdit, settings,
    } = useOutletContext();

    // Search, filter
    const [activeMenu, setActiveMenu] = useState(null); // 'status', 'weekDay', null 
    const [weekDayFilter, setWeekDayFilter] = useState(-1); // -1: all, 0 sun, 1 mon, ...
    const [filters, setFilters] = useState({ today: 'all', tomorrow: 'all', week: 'all' });
    const [sorts, setSorts] = useState({ today: 'asc', tomorrow: 'asc', week: 'asc' });

    const handleSort = (section) => {
        setSorts(prev => ({ ...prev, [section]: prev[section] === 'asc' ? 'desc' : 'asc' }));
    };

    const handleFilter = (section, status) => {
        setFilters(prev => ({ ...prev, [section]: status }));
        setActiveMenu(null);
    };

    const searchOutput = useMemo(() => {
        let result = [...(tasks || [])];
        if (searchQuery) {
            result = result.filter(t => t.title.toLowerCase().includes(searchQuery.toLowerCase()));
        }
        return result; 
    }, [tasks, searchQuery]);

    // Lọc và sort
    const processSectionList = useCallback((list, section) => {
        let result = [...list];

        // Lọc status
        const currentFilter = filters[section]; 
        if (currentFilter === 'completed') result = result.filter(t => t.is_completed);
        else if (currentFilter === 'pending') result = result.filter(t => !t.is_completed);

        // Lọc thứ trong tuần
        if (section === 'week' && weekDayFilter !== -1) {
            result = result.filter(t => {
                if (!t.deadline) return false;
                return new Date(t.deadline).getDay() === weekDayFilter;
            });
        }

        // Sort Deadline
        const currentSort = sorts[section];
        result.sort((a, b) => {
            if (a.id === justCreatedId) return -1; // Task mới tạo lên đầu
            if (b.id === justCreatedId) return 1;

            if (!a.deadline) return 1;
            if (!b.deadline) return -1;
            
            const dlA = new Date(a.deadline);
            const dlB = new Date(b.deadline);
            return currentSort === 'asc' ? dlA - dlB : dlB - dlA;
        });

        return result;
    }, [filters, sorts, weekDayFilter, justCreatedId]);

    const todayTasks = useMemo(() => {
        const raw = searchOutput.filter(t => sameDay(new Date(t.deadline), new Date()));
        return processSectionList(raw, 'today');
    }, [searchOutput, processSectionList]);

    const tomorrowTasks = useMemo(() => {
        const raw = searchOutput.filter(t => Tomorrow(new Date(t.deadline)));
        return processSectionList(raw, 'tomorrow');
    }, [searchOutput, processSectionList]);

    const weekTasks = useMemo(() => {
        const raw = searchOutput.filter(t => ThisWeek(new Date(t.deadline)));
        return processSectionList(raw, 'week');
    }, [searchOutput, processSectionList]); 

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (!event.target.closest(`.${styles.filterContainer}`))
                setActiveMenu(null);
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Main content cho Lists
    // setup phân trang cho 3 bảng
    const [currentPage, setCurrentPage] = useState(1);
    const [tomorrowPage, setTomorrowPage] = useState(1);
    const [weekPage, setWeekPage] = useState(1);
    const cnt = 5;
    
    const renderTodayTable = (list, emptyMessage) => {
        // phân trang today
        const totalPages = Math.ceil(list.length / cnt);
        const currentTodayTasks = list.slice(
            (currentPage - 1) * cnt, // for i =
            currentPage * cnt // i <= n
        );

        const emptyRowsCount = Math.max(0, cnt - currentTodayTasks.length);

        return (
            <div className={styles.todaySection}>
                
                {/* Bảng */}
                <div className={styles.gridHeader}>
                    <div className={styles.colTitle}>Tên</div>
                    
                    <div className={styles.colDesc}>Mô tả</div>
                    
                    <div className={styles.filterContainer}>
                        <div 
                            className={styles.headerColRight}
                            onClick={() => handleSort('today')}
                            style={{ cursor: 'pointer', userSelect: 'none' }}
                            title="Bấm để sắp xếp theo hạn chót">
                                Deadline {sorts.today === 'asc' ? '▲' : '▼'}
                        </div>
                    </div>

                    <div className={styles.filterContainer}>
                        <div 
                            className={styles.headerColCenter}
                            onClick={() => setActiveMenu(activeMenu === 'status_today' ? null : 'status_today')}
                            style={{ cursor: 'pointer', userSelect: 'none' }}
                        >
                            {filters.today === 'all' ? 'Trạng thái' : filters.today === 'pending' ? 'Chưa xong' : 'Đã xong'} ▼
                        </div>

                        {activeMenu === 'status_today' && (
                            <div className={styles.dropdownMenu}>
                                <div 
                                    className={`${styles.menuItem} ${filters.today === 'all' ? styles.active : ''}`} 
                                    onClick={() => handleFilter('today', 'all')}>Tất cả</div>
                                <div 
                                    className={`${styles.menuItem} ${filters.today === 'pending' ? styles.active : ''}`} 
                                    onClick={() => handleFilter('today', 'pending')}>Chưa xong</div>
                                <div 
                                    className={`${styles.menuItem} ${filters.today === 'completed' ? styles.active : ''}`} 
                                    onClick={() => handleFilter('today', 'completed')}>Đã xong</div>
                            </div>
                        )}
                    </div>

                    <div className={styles.colCenter}>Sửa</div>
                </div>

                {/* 2. BODY LIST */}
                <div className={styles.gridBody}>
                    {currentTodayTasks.map(task => (
                        <div 
                            key={task.id} 
                            className={styles.gridRow} 
                            style={getTaskStyle(task)} 
                            onClick={() => setDetailTask(task)}>

                            {/* name */}
                            <div className={`${styles.colTitle} ${settings.isStrikethrough && task.is_completed ? styles.strikethrough : ''}`}>
                                {task.title}
                            </div>
                            
                            {/* des */}
                            <div className={styles.colDesc}>{task.description}</div>
                            
                            {/* deadline */}
                            <div className={styles.colDate}>
                                {task.deadline ? formatDateTime(task.deadline) : '-'}
                            </div>
                            
                            {/* checkbox */}
                            <div className={styles.colCenter} onClick={e => e.stopPropagation()}>
                                <input 
                                    type="checkbox" 
                                    checked={task.is_completed} 
                                    onChange={() => handleToggleComplete(task)}
                                    className={styles.checkbox}
                                />
                            </div>
                            
                            {/* sửa */}
                            <div className={styles.colCenter}>
                                <button className={styles.iconBtn} onClick={(e) => openEdit(task, e)}>✏️</button>
                            </div>
                        </div>
                    ))}

                    {/* DÒNG RỖNG (Để giữ form không bị nhảy) */}
                    {Array.from({ length: emptyRowsCount }).map((_, index) => (
                        <div key={`empty-${index}`} className={styles.emptyRow}></div>
                    ))}

                    {/* nếu 0 có task */}
                    {list.length === 0 && (
                        <div className={styles.emptyOverlay}>{emptyMessage}</div>
                    )}
                </div>

                {/* Phân trang */}
                {totalPages > 1 && (
                    <div className={styles.paginationFooter}>
                        <button disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)} className={styles.pageBtn}>◀</button>
                        <span className={styles.pageInfo}>{currentPage} / {totalPages}</span>
                        <button disabled={currentPage === totalPages} onClick={() => setCurrentPage(p => p + 1)} className={styles.pageBtn}>▶</button>
                    </div>
                )}
            </div>
        );
    };

    const renderPagedList = (title, list, page, setPage, emptyMessage) => {
        const sectionId = title === "Tuần này" ? "week" : "tomorrow";

        const totalPages = Math.ceil(list.length / (cnt-1));
        const currentItems = list.slice(
            (page - 1) * (cnt-1),
            page * (cnt-1)
        );
        
        const emptyRowsCount = Math.max(0, (cnt-1) - currentItems.length);

        return (
            <div className={styles.halfColumn}>
                <h3 className={styles.sectionTitle}>{title}</h3>

                <div className={styles.listHeader}>
                    <div className={styles.headerColLeft}>Tên</div>
                    
                    <div className={styles.filterContainer}>
                        {title === "Tuần này" ? (
                            <>
                                {/* week */}
                                <div 
                                    className={styles.headerColRight}
                                    onClick={() => setActiveMenu(activeMenu === 'weekDay' ? null : 'weekDay')}
                                    style={{cursor: 'pointer', userSelect: 'none'}}
                                >
                                    {weekDayFilter === -1 ? 'Cả tuần' : `Thứ ${weekDayFilter === 0 ? 'CN' : weekDayFilter + 1}`} ▼
                                </div>
                                
                                {/* Menu chọn thứ */}
                                {activeMenu === 'weekDay' && (
                                <div className={styles.dropdownMenu}>
                                    <div 
                                        className={`${styles.menuItem} ${weekDayFilter === -1 ? styles.active : ''}`} 
                                        onClick={() => { setWeekDayFilter(-1); setActiveMenu(null); }}>Cả tuần</div>
                                        {[1, 2, 3, 4, 5, 6, 0].map(d => (
                                        <div key={d} 
                                            className={styles.menuItem} 
                                            onClick={() => { setWeekDayFilter(d); setActiveMenu(null); }}>
                                            {d === 0 ? 'Chủ nhật' : `Thứ ${d + 1}`}
                                        </div>
                                    ))}
                                </div>
                            )}
                            </>
                        ) : (
                            /* tomorrow */
                            <div 
                                className={styles.headerColRight}
                                onClick={() => handleSort(sectionId)}
                                style={{cursor: 'pointer', userSelect: 'none'}}
                                title="Sắp xếp tăng/giảm"
                            >
                                Deadline {sorts[sectionId] === 'asc' ? '▲' : '▼'}
                            </div>
                        )}
                    </div>

                    <div className={styles.filterContainer}>
                        <div 
                            className={styles.headerColCenter}
                            onClick={() => setActiveMenu(activeMenu === `status_${sectionId}` ? null : `status_${sectionId}`)}
                            style={{cursor: 'pointer', userSelect: 'none'}}
                        >
                            {filters[sectionId] === 'all' ? 'Trạng thái' : filters[sectionId] === 'pending' ? 'Chưa xong' : 'Đã xong'} ▼
                        </div>

                        {activeMenu === `status_${sectionId}` && (
                            <div className={styles.dropdownMenu}>
                                <div 
                                    className={`${styles.menuItem} ${filters[sectionId] === 'all' ? styles.active : ''}`} 
                                    onClick={() => handleFilter(sectionId, 'all')}>Tất cả</div>
                                <div 
                                    className={`${styles.menuItem} ${filters[sectionId] === 'pending' ? styles.active : ''}`} 
                                    onClick={() => handleFilter(sectionId, 'pending')}>Chưa xong</div>
                                <div 
                                    className={`${styles.menuItem} ${filters[sectionId] === 'completed' ? styles.active : ''}`} 
                                    onClick={() => handleFilter(sectionId, 'completed')}>Đã xong</div>
                            </div>
                        )}
                    </div>
                </div>

                <div className={styles.simpleListBody}>
                    {currentItems.map(task => (
                        <div 
                            key={task.id} 
                            className={styles.simpleRowGrid}
                            style={getTaskStyle(task)}
                            onClick={() => setDetailTask(task)}>

                            {/* name */}
                            <div className={`${styles.headerColLeft} ${settings.isStrikethrough && task.is_completed ? styles.strikethrough : ''}`}>
                                {task.title}
                            </div>

                            {/* deadline */}
                            <div className={styles.headerColRight}>
                                {task.deadline ? formatDateTime(task.deadline) : '-'}
                            </div>
                            
                            {/* checkbox */}
                            <div className={styles.headerColCenter} onClick={e => e.stopPropagation()}>
                                <input 
                                    type="checkbox" 
                                    checked={task.is_completed} 
                                    onChange={() => handleToggleComplete(task)}
                                    className={styles.checkbox}
                                />
                            </div>
                        </div>
                    ))}

                    {Array.from({ length: emptyRowsCount }).map((_, index) => (
                        <div key={`empty-${index}`} className={styles.simpleEmptyRow}></div>
                    ))}
                    
                    {/* nếu 0 có task */}
                    {list.length === 0 && (
                        <div className={styles.emptyOverlay}>{emptyMessage}</div>
                    )}
                </div>

                {/* phân trang */}
                {totalPages > 1 && (
                    <div className={styles.paginationSimple}>
                        <button disabled={page === 1} onClick={() => setPage(p => p - 1)} className={styles.pageBtnSmall}>◀</button>
                        <span className={styles.pageInfoSmall}>{page}/{totalPages}</span>
                        <button disabled={page === totalPages} onClick={() => setPage(p => p + 1)} className={styles.pageBtnSmall}>▶</button>
                    </div>
                )}
            </div>
        );
    };

    return (
        <div>
            <div className={styles.mainHeader}>
                <h1 className={styles.pageTitle}>List View</h1>
                <span className={styles.taskCount}>
                    {weekTasks.length} {weekTasks.length <= 1 ? 'Task' : 'Tasks'}
                </span>
            </div>

            <div className={styles.contentGrid}>
                {/* 1/2 trên: today */}
                <div className={styles.topSection}>
                    <h3 className={styles.sectionTitle}>Hôm nay ({todayTasks.length})</h3>
                    {renderTodayTable(todayTasks, "Ngày mới rồi, thêm task thôi")}
                </div>

                {/* 1/2 dưới */}
                <div className={styles.bottomSection}>
                    {/* Trái: mai */}
                    {renderPagedList("Ngày mai", tomorrowTasks, tomorrowPage, setTomorrowPage, "Không có task nào.")}

                    {/* Phải: tuần */}
                    {renderPagedList("Tuần này", weekTasks, weekPage, setWeekPage, "Tuần này rảnh rỗi.")}
                </div>
            </div>
        </div>
    );
};

export default ListView;