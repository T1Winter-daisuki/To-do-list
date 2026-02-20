import React, { useEffect, useState, useMemo, useRef, useCallback } from 'react';
import { toast } from 'react-toastify';
import * as taskServices from '../../1services/taskServices';
import styles from './TodoPage.module.css';
import { useAuth } from '../../2context/AuthContext';
import { sameDay, Tomorrow, ThisWeek, outOfDate, toLocalISOString, formatDateTime } from '../../utils/dateHelper';

const TodoPage = () => {
    const [viewMode, setViewMode] = useState('list');
    const [showSettingsModal, setShowSettingsModal] = useState(false);

    // resize sidebar
    const [sidebarWidth, setSidebarWidth] = useState(15); 
    const isResizing = useRef(false);
    const Resizing = () => { isResizing.current = true; };
    const notResizing = () => { isResizing.current = false; };
    const resize = (e) => {
        if (isResizing.current) {
            const newWidth = (e.clientX / window.innerWidth) * 100;
            if (newWidth >= 10 && newWidth <= 20) 
                setSidebarWidth(newWidth);
        }
    };
    useEffect(() => {
        window.addEventListener('mousemove', resize);
        window.addEventListener('mouseup', notResizing);
        return () => {
            window.removeEventListener('mousemove', resize);
            window.removeEventListener('mouseup', notResizing);
        };
    }, []);

    const [tasks, setTasks] = useState([]);
    // getTask
    const loadTasks = async () => {
        try {
            const res = await taskServices.getTasks();
            setTasks(res.data || []);
        } catch (error) { 
            console.error(error); 
        }
    };
    useEffect(() => { 
        loadTasks(); 
    }, []);

    // Search, filter
    const [searchQuery, setSearchQuery] = useState('');
    const [justCreatedId, setJustCreatedId] = useState(null);
    const [activeMenu, setActiveMenu] = useState(null); // 'status', 'weekDay', null 
    const [weekDayFilter, setWeekDayFilter] = useState(-1); // -1: all, 0 sun, 1 mon, ...
    const [filters, setFilters] = useState({
        today: 'all',
        tomorrow: 'all',
        week: 'all'
    });
    const [sorts, setSorts] = useState({
        today: 'asc',
        tomorrow: 'asc',
        week: 'asc'
    });

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

    // CUD
    const [formData, setFormData] = useState({ title: '', description: '', start_time: '', deadline: '', is_completed: false });
    const [isEditing, setIsEditing] = useState(null);
    const [showCreateModal, setShowCreateModal] = useState(false);
    
    // setup popup
    const Popup = (datePreset = null) => {
        const startDate = datePreset ? new Date(datePreset) : new Date();
        const endDate = new Date(startDate.getTime() + 60 * 60 * 1000);

        setFormData({
            title: '',
            description: '',

            start_time: toLocalISOString(startDate), 
            deadline: toLocalISOString(endDate),

            is_completed: false,
        });
        setIsEditing(null);
        setShowCreateModal(true);
    };

    // setup update
    const openEdit = (task, e) => {
        e.stopPropagation(); // cô lập hành động nút con, không ảnh hưởng hành động khung ngoài.
        
        setFormData({
            title: task.title,
            description: task.description || '',
            
            start_time: task.start_time ? toLocalISOString(task.start_time) : null,
            deadline: task.deadline ? toLocalISOString(task.deadline) : null,
            
            is_completed: task.is_completed || false
        });
        setIsEditing(task.id);
        setShowCreateModal(true);
    };

    // C, U
    const handleCreateOrUpdate = async (e) => {
        e.preventDefault(); // tránh reload page sau khi tải lên
        try {
            let payload = {
                ...formData,
                start_time: formData.start_time ? new Date(formData.start_time).toISOString() : null, 
                deadline: formData.deadline ? new Date(formData.deadline).toISOString() : null
            };
            
            if (payload.start_time && payload.deadline && payload.start_time > payload.deadline) {
                toast.warning("Ngày bắt đầu không thể lớn hơn Deadline!");
                return;
            }

            if (isEditing) {
                payload = { ...payload, id: isEditing };
                const res = await taskServices.updateTask(isEditing, payload);
                setTasks(tasks.map(t => t.id === isEditing ? res.data : t));
                toast.success("Đã cập nhật!");
                setJustCreatedId(null);
            } else {
                const res = await taskServices.createTask(payload);
                setTasks([res.data, ...tasks]);
                toast.success("Đã thêm mới!");
                setJustCreatedId(res.data.id);
            }

            setShowCreateModal(false);
        } catch (error) { 
            const msg = error.response?.data?.message || error.message;
            toast.error(msg);
        }
    };

    // check done
    const handleToggleComplete = async (task) => {
        try {
            const payload = {
                id: task.id,
                title: task.title,
                description: task.description || "",

                start_time: task.start_time,
                deadline: task.deadline,
                
                is_completed: !task.is_completed
            };

            const res = await taskServices.updateTask(task.id, payload);
            setTasks(prevTasks => prevTasks.map(t => t.id === task.id ? res.data : t));
            
            if (payload.is_completed) 
                toast.info("Đã xong!");
        } catch (error) { 
            const msg = error.response?.data?.message || error.message;
            toast.error(msg);
        }
    };

    // D
    const [detailTask, setDetailTask] = useState(null);
    const [deleteTaskId, setDeleteTaskId] = useState(null);
    const openDeleteConfirm = (id, e) => {
        e.stopPropagation(); // Chặn click xuyên thấu
        setDeleteTaskId(id);
    };
    const handleDelete = async () => {
        if (!deleteTaskId) return;
        try {
            await taskServices.deleteTask(deleteTaskId);
            
            setTasks(tasks.filter(t => t.id !== deleteTaskId));
            toast.success("Đã xóa task!");
            setDeleteTaskId(null);
        } catch (error) { 
            toast.error(error.message); 
        }
    }

    // while loading
    const { user } = useAuth();
    const [isLoading, setIsLoading] = useState(true);
    useEffect(() => {
        const fetchTasks = async () => {
            setIsLoading(true);
            try {
                const res = await taskServices.getTasks(user.id);
                setTasks(res.data);
            } catch (error) {
            } finally {
                setTimeout(() => setIsLoading(false), 500); 
                setIsLoading(false); 
            }
            };
        if (user && user.id) fetchTasks();
    }, [user]);

    // task colors
    const defaultSettings = {
        colorCompleted: '#d4edda',
        colorPending: '#FBF3D1',
        colorOverdue: '#f8d7da',
        isStrikethrough: false
    };
    const [settings, setSettings] = useState(() => {
        try {
            const saved = localStorage.getItem('todoApp_settings');
            if (saved)
                return JSON.parse(saved);
        } catch (error) {}
        return defaultSettings;
    });
    useEffect(() => {
        localStorage.setItem('todoApp_settings', JSON.stringify(settings));
    }, [settings]);

    const getTaskStyle = (task) => {
        if (task.is_completed) 
            return { backgroundColor: settings.colorCompleted };
        if (task.deadline && outOfDate(task.deadline)) 
            return { backgroundColor: settings.colorOverdue };
        return { backgroundColor: settings.colorPending };
    };

    // Main content cho Lists
    // setup phân trang cho 3 bảng
    const [currentPage, setCurrentPage] = useState(1);
    const [tomorrowPage, setTomorrowPage] = useState(1);
    const [weekPage, setWeekPage] = useState(1);
    const cnt = 5;

    // Today
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

    if (isLoading) {
        return (
            <div style={{ 
                display: 'flex', 
                justifyContent: 'center', 
                alignItems: 'center', 
                height: '100vh', 
                fontSize: '18px',
                color: '#888'
            }}>
                ⏳ Đang tải dữ liệu...
            </div>
        );
    }

    return (
        <div className={styles.container}>
            {/* Menu */}
            <div className={styles.sidebar} style={{ width: `${sidebarWidth}%` }}>
                <div className={styles.menuHeader}>
                    <span className={styles.menuTitle}>MENU</span>
                    <button className={styles.addBtn} onClick={() => Popup()}>+</button>
                </div>

                {/* Search */}
                <div className={styles.searchBox}>
                    <input 
                        type="text" 
                        placeholder="Tìm kiếm..." 
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                    />
                </div>

                {/* Tasks Navigation */}
                <div className={styles.navSection}>
                    <div className={styles.navLabel}>TASKS</div>
                    <div className={`${styles.navItem} ${viewMode === 'list' ? styles.active : ''}`} onClick={() => setViewMode('list')}>
                        📝 List
                    </div>
                    <div className={`${styles.navItem} ${viewMode === 'calendar' ? styles.active : ''}`} onClick={() => setViewMode('calendar')}>
                        📅 Calendar
                    </div>
                    <div className={`${styles.navItem} ${viewMode === 'sticky' ? styles.active : ''}`} onClick={() => setViewMode('sticky')}>
                        📌 Sticky Wall
                    </div>
                </div>

                {/* Tags */}
                <div className={styles.navSection}>
                    <div className={styles.navLabel}>LISTS</div>
                    <div className={styles.navLabel}>TAGS</div>
                </div>

                {/* Settings & resize menu */}
                <div className={styles.sidebarFooter}>
                    <button className={styles.settingsBtn} onClick={() => setShowSettingsModal(true)}>⚙️ Settings</button>
                </div>
                
                <div className={styles.resizer} onMouseDown={Resizing} />
            </div>

            {/* Main content */}
            <div className={styles.mainContent}>
                {/* List headers */}
                <div className={styles.mainHeader}>
                    <h1 className={styles.pageTitle}>
                        {viewMode === 'list' ? 'List View' : viewMode === 'calendar' ? 'Calendar' : 'Sticky Wall'}
                    </h1>
                    <span className={styles.taskCount}>{tasks.length} Tasks</span>
                </div>

                {viewMode === 'list' ? (
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
                ) : (
                    <div className={styles.placeholderView}>Chức năng đang cập nhật...</div>
                )}
            </div>

            {/* C, U */}
            {showCreateModal && (
                <div className={styles.modalOverlay} onClick={() => setShowCreateModal(false)}>
                    <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
                        <h3>{isEditing ? 'Sửa Task' : 'Tạo Task Mới'}</h3>
                        <form onSubmit={handleCreateOrUpdate}>
                            {/* name */}
                            <input 
                                className={styles.inputField} 
                                placeholder="Tên Task" 
                                value={formData.title} 
                                onChange={e => setFormData({...formData, title: e.target.value})} 
                                required />
                            
                            {/* des */}
                            <textarea 
                                className={styles.textArea} 
                                placeholder="Mô tả" 
                                value={formData.description} 
                                onChange={e => setFormData({...formData, description: e.target.value})} 
                            />
                            
                            {/* time */}
                            <div className={styles.row}>
                                <div style={{flex:1}}>
                                    <label>Bắt đầu:</label>
                                    <input 
                                        type="datetime-local" 
                                        className={styles.inputField} 
                                        value={formData.start_time} 
                                        onChange={e => setFormData({...formData, start_time: e.target.value})} 
                                    />
                                </div>
                                <div style={{flex:1}}>
                                    <label>Deadline:</label>
                                    <input 
                                        type="datetime-local" 
                                        className={styles.inputField} 
                                        value={formData.deadline} 
                                        onChange={e => setFormData({...formData, deadline: e.target.value})} 
                                    />
                                </div>
                            </div>
                            
                            {/* check */}
                            <div className={styles.row} style={{alignItems: 'center', marginTop: '10px'}}>
                                <input 
                                    type="checkbox" 
                                    id="isCompletedCheck"
                                    checked={formData.is_completed} 
                                    onChange={e => setFormData({...formData, is_completed: e.target.checked})} 
                                    style={{width: '20px', height: '20px', marginRight: '10px', cursor: 'pointer'}}
                                />
                                <label htmlFor="isCompletedCheck" style={{cursor: 'pointer', userSelect: 'none'}}>
                                    Đánh dấu đã hoàn thành
                                </label>
                            </div>

                            <div className={styles.modalActions}>
                                <button type="button" onClick={() => setShowCreateModal(false)}>Hủy</button>
                                <button type="submit" className={styles.saveBtn}>Lưu</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Settings */}
            {showSettingsModal && (
                <div className={styles.modalOverlay} onClick={() => setShowSettingsModal(false)}>
                    <div className={styles.settingsModal} onClick={e => e.stopPropagation()}>
                        <h3>Cài đặt giao diện</h3>
                        <div className={styles.settingRow}>
                            <label>Xong: </label>
                            <input type="color" value={settings.colorCompleted} onChange={e => setSettings({...settings, colorCompleted: e.target.value})} />
                        </div>

                        <div className={styles.settingRow}>
                            <label>Chờ: </label>
                            <input type="color" value={settings.colorPending} onChange={e => setSettings({...settings, colorPending: e.target.value})} />
                        </div>

                        <div className={styles.settingRow}>
                            <label>Quá hạn: </label>
                            <input type="color" value={settings.colorOverdue} onChange={e => setSettings({...settings, colorOverdue: e.target.value})} />
                        </div>

                        <div className={styles.settingRow}>
                            <label>Gạch ngang: </label>
                            <input type="checkbox" checked={settings.isStrikethrough} onChange={e => setSettings({...settings, isStrikethrough: e.target.checked})} />
                        </div>
                        
                        <div className={styles.modalActions}>
                            <button onClick={() => setShowSettingsModal(false)}>Đóng</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Details */}
            {detailTask && (
                <div className={styles.modalOverlay} onClick={() => setDetailTask(null)}>
                    <div className={styles.detailCard} onClick={e => e.stopPropagation()}>
                        <h2 className={styles.detailTitle}>{detailTask.title}</h2>
                        <div className={styles.detailMeta}>
                            <span className={styles.detailTag}>{detailTask.is_completed ? "Đã xong" : "Đang làm"}</span>
                            <span>📅 {detailTask.deadline ? formatDateTime(detailTask.deadline) : "Không có hạn"}</span>
                        </div>
                        <div className={styles.detailDesc}>
                            <p>{detailTask.description || "Không có mô tả."}</p>
                        </div>
                        <div className={styles.modalActions}>
                            <button className={styles.iconBtn} onClick={(e) => {setDetailTask(null); openEdit(detailTask, e);}}>Sửa</button>
                            <button className={styles.iconBtn} style={{color:'red'}} onClick={(e) => {setDetailTask(null); openDeleteConfirm(detailTask.id, e);}}>Xóa</button>
                            <button onClick={() => setDetailTask(null)}>Đóng</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete */}
             {deleteTaskId && (
                <div className={styles.modalOverlay} onClick={() => setDeleteTaskId(null)}>
                    <div className={styles.modalContent} style={{width: 300, textAlign:'center'}} onClick={e => e.stopPropagation()}>
                        <h3>Xác nhận xóa?</h3>
                        <p>Hành động này không thể hoàn tác.</p>
                        <div className={styles.modalActions} style={{justifyContent:'center'}}>
                            <button onClick={() => setDeleteTaskId(null)}>Hủy</button>
                            <button onClick={handleDelete} style={{background:'#d9534f', color:'white'}}>Xóa</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TodoPage;