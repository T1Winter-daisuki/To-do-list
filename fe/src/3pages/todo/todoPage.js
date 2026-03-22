import React, { useEffect, useState, useRef } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useTasks } from '../../5hooks/Tasks';
import styles from './TodoPage.module.css';
import { useAuth } from '../../2context/AuthContext';
import { outOfDate, toLocalISOString, formatDateTime } from '../../utils/dateHelper';

const TodoPage = () => {
    const navigate = useNavigate();
    const location = useLocation();
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

    // CUD
    const [searchQuery, setSearchQuery] = useState('');
    const [justCreatedId, setJustCreatedId] = useState(null);
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

            const result = await handleCreateOrUpdateTask(payload, isEditing);
        
            if (result.success) {
                setJustCreatedId(isEditing ? null : result.data.id);
                setShowCreateModal(false);
            }
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
            const success = await handleDeleteTask(deleteTaskId);
            if (success) {
                setDeleteTaskId(null);
            }
        } catch (error) { 
            toast.error(error.message); 
        }
    }

    // while loading
    const { user } = useAuth();
    const { 
        tasks, isLoading, 
        handleCreateOrUpdateTask, handleToggleComplete, handleDeleteTask 
    } = useTasks(user?.id);

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
                    <div className={`${styles.navItem} ${location.pathname.includes('/list') ? styles.active : ''}`} onClick={() => navigate('/todo/list')}>
                        📝 List
                    </div>
                    <div className={`${styles.navItem} ${location.pathname.includes('/calendar') ? styles.active : ''}`} onClick={() => navigate('/todo/calendar')}>
                        📅 Calendar
                    </div>
                    <div className={`${styles.navItem} ${location.pathname.includes('/wall') ? styles.active : ''}`} onClick={() => navigate('/todo/wall')}>
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
                <Outlet 
                    context={{ 
                        tasks,searchQuery,
                        justCreatedId, handleToggleComplete, setDetailTask,
                        getTaskStyle, openEdit, settings,
                    }} 
                />
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