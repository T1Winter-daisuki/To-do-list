import React, { useState, useMemo, useRef, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { toast } from 'react-toastify';
import styles from './Wall.module.css';

const formatShortDate = (dateString) => {
    if (!dateString) return '';
    const d = new Date(dateString);
    return `${d.getDate()}/${d.getMonth() + 1}`;
};

const noteColors = [styles.colorYellow, styles.colorBlue, styles.colorPink, styles.colorGreen];
const noteRotations = [styles.rotateLeft1, styles.rotateLeft2, styles.rotateRight1, styles.rotateRight2, ''];

const StickyWall = () => {
    const { tasks, setDetailTask, handleDeleteMultipleTasks, handleToggleComplete } = useOutletContext();
    
    // Lưu vị trí kéo
    const [overrides, setOverrides] = useState(() => {
        const saved = localStorage.getItem('stickyWallOverrides');
        return saved ? JSON.parse(saved) : {};
    });

    // Lưu vị trí mỗi khi thay đổi
    useEffect(() => {
        localStorage.setItem('stickyWallOverrides', JSON.stringify(overrides));
    }, [overrides]);

    const [draggedTaskId, setDraggedTaskId] = useState(null);
    const [selectedTasks, setSelectedTasks] = useState([]);
    useEffect(() => {
        setSelectedTasks(prev => prev.filter(id => tasks.some(t => t.id === id)));
    }, [tasks]);

    const [showConfirmModal, setShowConfirmModal] = useState(false);

    const clickTimer = useRef(null);

    // Click 1: mở details
    const handleNoteClick = (task) => {
        clearTimeout(clickTimer.current);
        clickTimer.current = setTimeout(() => {
            setDetailTask(task);
        }, 200); 
    };

    // Click đúp: chọn
    const handleNoteDoubleClick = (taskId) => {
        clearTimeout(clickTimer.current); 
        setSelectedTasks(prev => 
            prev.includes(taskId) ? prev.filter(id => id !== taskId) : [...prev, taskId]
        );
    };

    // D
    const confirmDelete = async () => {
        if (handleDeleteMultipleTasks) {
            const success = await handleDeleteMultipleTasks(selectedTasks);
            if (success) {
                setSelectedTasks([]); 
                setShowConfirmModal(false);
            }
        } else {
            toast.error("Lỗi xóa Tasks");
        }
    };

    const handleToggleSelectedStatus = async () => {
        if (!handleToggleComplete) {
            alert("Lỗi: Chưa truyền handleToggleComplete vào Context!");
            return;
        }
        
        // Lấy ra toàn bộ object của các task đang được chọn
        const tasksToUpdate = tasks.filter(t => selectedTasks.includes(t.id));
        
        // Chạy Promise.all để gọi API Update song song cho tất cả các task đó
        await Promise.all(tasksToUpdate.map(t => handleToggleComplete(t)));
        
        // Đổi trạng thái xong thì bỏ chọn để giao diện gọn gàng
        setSelectedTasks([]);
    };

    const quadrantsData = useMemo(() => {
        // Xét hạn dl để mặc định đưa vào ô phù hợp
        const getTaskPlacement = (task) => {
            if (overrides[task.id]) return overrides[task.id];

            let q = 'q4';
            if (task.deadline) {
                const diffHours = (new Date(task.deadline) - new Date()) / (1000 * 60 * 60);
                q = diffHours <= 48 ? 'q1' : 'q2';
            }
            
            // 🌟 Tọa độ random né phần Header (Y chạy từ 15% đến 55%)
            const randomX = (task.id * 37) % 60;
            const randomY = 15 + ((task.id * 23) % 40);

            return { q, x: randomX, y: randomY };
        };

        const result = { q1: [], q2: [], q3: [], q4: [] };
        (tasks || []).forEach(task => {
            const placement = getTaskPlacement(task);
            if (result[placement.q]) {
                result[placement.q].push({ ...task, posX: placement.x, posY: placement.y });
            }
        });
        return result;
    }, [tasks, overrides]);

    // Bắt đầu kéo
    const handleDragStart = (e, taskId) => {
        const rect = e.currentTarget.getBoundingClientRect();
        // Tính khoảng cách từ ngón tay đến mép trái/trên của tờ giấy
        const offsetX = e.clientX - rect.left;
        const offsetY = e.clientY - rect.top;

        setDraggedTaskId(taskId);
        e.dataTransfer.setData('application/json', JSON.stringify({ taskId, offsetX, offsetY }));
        e.dataTransfer.effectAllowed = 'move';
    };

    const handleDragOver = (e) => {
        e.preventDefault(); 
        e.dataTransfer.dropEffect = 'move';
    };

    // Tính toán lại tọa độ Drop
    const handleDrop = (e, quadrantId) => {
        e.preventDefault();
        const dataStr = e.dataTransfer.getData('application/json');
        if (!dataStr) return;

        const { taskId, offsetX, offsetY } = JSON.parse(dataStr);
        if (taskId) {
            const rect = e.currentTarget.getBoundingClientRect();
            
            // Lấy tọa độ chuột TRỪ đi khoảng cách ngón tay (offsetX/Y) để giấy rơi đúng chỗ
            let pixelX = e.clientX - rect.left - offsetX;
            let pixelY = e.clientY - rect.top - offsetY;

            // Chuyển sang %
            let x = (pixelX / rect.width) * 100;
            let y = (pixelY / rect.height) * 100;

            // Ép giới hạn
            x = Math.max(0, Math.min(x, 65));
            y = Math.max(15, Math.min(y, 65));

            setOverrides(prev => ({ 
                ...prev, 
                [taskId]: { q: quadrantId, x, y } 
            }));
        }
        setDraggedTaskId(null);
    };

    const renderQuadrant = (id, title, desc, tasksList) => (
        <div 
            className={`${styles.quadrant} ${styles[id]}`}
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, id)}
        >
            <div className={styles.quadrantTitle}>
                {title} <br/> <span style={{fontSize: '11px', fontWeight: 'normal'}}>{desc}</span>
            </div>
            
            <div className={styles.notesContainer}>
                {tasksList.map(task => {
                    const colorClass = noteColors[task.id % noteColors.length];
                    const rotateClass = noteRotations[task.id % noteRotations.length];
                    const isDragging = draggedTaskId === task.id;
                    const isSelected = selectedTasks.includes(task.id);

                    return (
                        <div 
                            key={task.id}
                            className={`${styles.stickyNote} ${colorClass} ${rotateClass} ${task.is_completed ? styles.completedNote : ''}`}
                            style={{ 
                                opacity: isDragging ? 0 : 1, 
                                left: `${task.posX}%`, 
                                top: `${task.posY}%` 
                            }}
                            draggable="true"
                            onDragStart={(e) => handleDragStart(e, task.id)}
                            onDragEnd={() => setDraggedTaskId(null)}
                            onClick={() => handleNoteClick(task)}
                            onDoubleClick={() => handleNoteDoubleClick(task.id)}
                        >
                            <div className={styles.pin}></div>
                            
                            {isSelected && (
                                <div className={styles.selectedOverlay}>✓</div>
                            )}

                            <div className={styles.noteTitle}>{task.title}</div>
                            <div className={styles.noteDesc}>{task.description}</div>
                            <div className={styles.noteDate}>
                                Hạn: {task.deadline ? formatShortDate(task.deadline) : '--'}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );

    return (
        <div className={styles.wallContainer}>
            <div className={styles.wallHeader}>
                <h1 className={styles.pageTitle}>Sticky Wall</h1>
                
                {selectedTasks.length > 0 && (
                    <div className={styles.headerActions}>
                        <span className={styles.selectedText}>Đã chọn: {selectedTasks.length} task</span>

                        <button className={styles.completeBtn} onClick={handleToggleSelectedStatus}>
                            ✔️ Đổi trạng thái
                        </button>
                        
                        <button className={styles.deleteBtn} onClick={() => setShowConfirmModal(true)}>
                            🗑️ Xóa đã chọn
                        </button>
                    </div>
                )}
            </div>

            <div className={styles.matrixGrid}>
                {renderQuadrant('q1', 'DO', '(Khẩn cấp & Quan trọng)', quadrantsData.q1)}
                {renderQuadrant('q2', 'DECIDE', '(Không Khẩn cấp nhưng Quan trọng)', quadrantsData.q2)}
                {renderQuadrant('q3', 'DELEGATE', '(Khẩn cấp nhưng Không Quan trọng)', quadrantsData.q3)}
                {renderQuadrant('q4', 'DELETE', '(Không Khẩn cấp & Không Quan trọng)', quadrantsData.q4)}
            </div>

            {showConfirmModal && (
                <div className={styles.modalOverlay}>
                    <div className={styles.confirmModal}>
                        <h3 className={styles.confirmTitle}>Xác nhận xóa?</h3>
                        <p className={styles.confirmText}>Bạn đang chọn xóa {selectedTasks.length} task. Hành động này không thể hoàn tác.</p>
                        <div className={styles.modalActions}>
                            <button className={styles.cancelBtn} onClick={() => setShowConfirmModal(false)}>Hủy</button>
                            <button className={styles.confirmDeleteBtn} onClick={confirmDelete}>Xóa</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default StickyWall;