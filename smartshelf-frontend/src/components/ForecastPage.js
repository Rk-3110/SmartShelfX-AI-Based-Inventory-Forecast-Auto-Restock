import React, { useState, useEffect, useContext } from 'react';
import api from '../api/api';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { ThemeContext } from '../ThemeContext';
import {
    Box, CssBaseline, Drawer, Toolbar, List, ListItem, ListItemButton,
    ListItemIcon, ListItemText, Divider, Typography, Paper,
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
    Chip, IconButton, CircularProgress,
    Button,
    Modal, TextField
} from '@mui/material';
// Icons
import DashboardIcon from '@mui/icons-material/Dashboard';
import BarChartIcon from '@mui/icons-material/BarChart';
import AiIcon from '@mui/icons-material/AutoAwesome';
import LogoutIcon from '@mui/icons-material/Logout';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import PeopleIcon from '@mui/icons-material/People';
import ShoppingCartCheckoutIcon from '@mui/icons-material/ShoppingCartCheckout';

const drawerWidth = 240;

// Modal Style (reused from other components)
const modalStyle = {
    position: 'absolute', top: '50%', left: '50%',
    transform: 'translate(-50%, -50%)', width: 400,
    bgcolor: 'background.paper', border: '2px solid #000',
    boxShadow: 24, p: 4, display: 'flex', flexDirection: 'column', gap: 2,
};


function ForecastPage() {
    const { themeMode, toggleTheme } = useContext(ThemeContext);
    const [forecasts, setForecasts] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    const role = localStorage.getItem('role');

    const [isPoModalOpen, setIsPoModalOpen] = useState(false);
    const [poData, setPoData] = useState({ productId: null, productName: '', quantity: 0 });


    useEffect(() => {
        fetchForecast();
    }, []);

    const fetchForecast = async () => {
        setLoading(true);
        try {
            const response = await api.get('/forecast');
            setForecasts(response.data);
        } catch (err) {
            console.error("Failed to fetch forecast", err);
             if (err.response && (err.response.status === 401 || err.response.status === 403)) {
                navigate('/login');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('role');
        navigate('/login');
    };

    // --- Purchase Order Handlers ---
    const handleOpenPoModal = (item) => {
        const suggestedQuantity = Math.max(10, Math.ceil(item.predictedDemand * 3));
        setPoData({
            productId: item.productId,
            productName: item.productName,
            quantity: suggestedQuantity,
        });
        setIsPoModalOpen(true);
    };

    const handleClosePoModal = () => {
        setIsPoModalOpen(false);
        setPoData({ productId: null, productName: '', quantity: 0 });
    };

    const handlePoSubmit = async (e) => {
        e.preventDefault();

        // --- CRITICAL FIX: Robust validation and conversion ---
        const quantityInt = parseInt(poData.quantity, 10);

        if (isNaN(quantityInt) || quantityInt <= 0) {
            alert("Please enter a valid quantity greater than zero.");
            return;
        }

        try {
            await api.post('/pos', {
                productId: poData.productId,
                quantity: quantityInt, // Ensure it's the valid integer
            });
            handleClosePoModal();
            alert(`Purchase Order created successfully for ${poData.productName}. Now awaiting approval.`);
            // Automatically navigate the user to the Restock Requests page after successful creation
            navigate('/restock-requests');

        } catch (err) {
            console.error("Failed to create PO:", err);
            // Log the specific error response from the server if available
            if (err.response && err.response.data) {
                console.error("Server Response:", err.response.data);
            }
            alert("Failed to create Purchase Order. Please check the console for server error details.");
        }
    };
    // --- END PO HANDLERS ---

    // Helper for status chip color
    const getStatusChip = (status) => {
        let chipColor = 'default';
        let variant = 'outlined';
        if (status === 'RESTOCK NEEDED') {
            chipColor = 'error';
            variant = 'filled';
        } else if (status === 'OVERSTOCKED') {
            chipColor = 'warning';
            variant = 'outlined';
        } else {
            chipColor = 'success';
            variant = 'outlined';
        }

        return (
            <Chip
                label={status}
                color={chipColor}
                variant={variant}
                sx={{ fontWeight: 'bold' }}
            />
        );
    };


    return (
        <Box sx={{ display: 'flex', bgcolor: 'background.default', minHeight: '100vh' }}>
            <CssBaseline />
            {/* SIDEBAR */}
            <Drawer
                variant="permanent"
                sx={{
                    width: drawerWidth,
                    flexShrink: 0,
                    [`& .MuiDrawer-paper`]: { width: drawerWidth, boxSizing: 'border-box', bgcolor: 'background.paper' },
                }}
            >
                <Toolbar sx={{ p: 2 }}>
                    <Typography variant="h6" noWrap component="div" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                        SmartShelf AI
                    </Typography>
                </Toolbar>
                <Box sx={{ overflow: 'auto' }}>
                    <List>
                        {/* Dynamic Home Link based on Role */}
                        <ListItem disablePadding>
                            <ListItemButton component={RouterLink} to={role === 'ADMIN' ? "/admin-dashboard" : "/dashboard"}>
                                <ListItemIcon><DashboardIcon /></ListItemIcon>
                                <ListItemText primary="Dashboard" />
                            </ListItemButton>
                        </ListItem>

                        {/* Admin Only Link */}
                         {role === 'ADMIN' && (
                            <ListItem disablePadding>
                                <ListItemButton component={RouterLink} to="/admin-users">
                                    <ListItemIcon><PeopleIcon /></ListItemIcon>
                                    <ListItemText primary="User Management" />
                                </ListItemButton>
                            </ListItem>
                        )}

                        <ListItem disablePadding>
                            <ListItemButton component={RouterLink} to="/sales-report">
                                <ListItemIcon><BarChartIcon /></ListItemIcon>
                                <ListItemText primary="Sales Report" />
                            </ListItemButton>
                        </ListItem>
                        <ListItem disablePadding>
                            <ListItemButton component={RouterLink} to="/forecast" selected>
                                <ListItemIcon><AiIcon sx={{ color: '#7c4dff' }} /></ListItemIcon>
                                <ListItemText primary="AI Forecast" />
                            </ListItemButton>
                        </ListItem>
                        {/* --- Restock Requests Link --- */}
                        <ListItem disablePadding>
                            <ListItemButton component={RouterLink} to="/restock-requests">
                                <ListItemIcon><ShoppingCartCheckoutIcon /></ListItemIcon>
                                <ListItemText primary="Restock Requests" />
                            </ListItemButton>
                        </ListItem>
                    </List>
                    <Divider sx={{ my: 2 }} />
                    <List>
                        <ListItem disablePadding>
                            <ListItemButton onClick={toggleTheme}>
                                <ListItemIcon>
                                    {themeMode === 'dark' ? <Brightness7Icon /> : <Brightness4Icon />}
                                </ListItemIcon>
                                <ListItemText primary={themeMode === 'dark' ? 'Light Mode' : 'Dark Mode'} />
                            </ListItemButton>
                        </ListItem>
                        <ListItem disablePadding>
                            <ListItemButton onClick={handleLogout}>
                                <ListItemIcon><LogoutIcon /></ListItemIcon>
                                <ListItemText primary="Logout" />
                            </ListItemButton>
                        </ListItem>
                    </List>
                </Box>
            </Drawer>

            {/* MAIN CONTENT */}
            <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
                <Toolbar />
                <Typography variant="h4" sx={{ mb: 1, fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: 1 }}>
                   <AiIcon fontSize="large" sx={{ color: '#7c4dff' }} /> AI Demand Forecast
                </Typography>
                <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
                    Predictive analysis based on historical sales data to prevent stockouts.
                </Typography>

                {loading ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', mt: 5 }}><CircularProgress /></Box>
                ) : (
                    <Paper sx={{ width: '100%', overflow: 'hidden', borderRadius: 3, boxShadow: 3, bgcolor: 'background.paper' }}>
                        <TableContainer>
                            <Table>
                                <TableHead sx={{ bgcolor: 'primary.main' }}>
                                    <TableRow>
                                        <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Product Name</TableCell>
                                        <TableCell sx={{ color: 'white', fontWeight: 'bold' }} align="right">Current Stock</TableCell>
                                        <TableCell sx={{ color: 'white', fontWeight: 'bold' }} align="right">Predicted Next Week Demand</TableCell>
                                        <TableCell sx={{ color: 'white', fontWeight: 'bold' }} align="center">Status</TableCell>
                                        <TableCell sx={{ color: 'white', fontWeight: 'bold' }} align="center">Action</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {forecasts.map((item) => (
                                        <TableRow key={item.productId} hover>
                                            <TableCell component="th" scope="row" sx={{ fontWeight: 'medium' }}>
                                                {item.productName}
                                            </TableCell>
                                            <TableCell align="right">{item.currentStock}</TableCell>
                                            <TableCell align="right" sx={{ fontWeight: 'bold' }}>{item.predictedDemand}</TableCell>
                                            <TableCell align="center">
                                                {getStatusChip(item.status)}
                                            </TableCell>
                                            <TableCell align="center">
                                                {item.status === 'RESTOCK NEEDED' && (
                                                    <Button
                                                        variant="contained"
                                                        size="small"
                                                        color="secondary"
                                                        onClick={() => handleOpenPoModal(item)}
                                                    >
                                                        Create PO
                                                    </Button>
                                                )}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </Paper>
                )}
            </Box>

            {/* --- NEW Purchase Order Modal --- */}
            <Modal open={isPoModalOpen} onClose={handleClosePoModal}>
                <Box component="form" onSubmit={handlePoSubmit} sx={modalStyle}>
                    <Typography variant="h6">Create Restock Order</Typography>
                    <Typography variant="body1" color="text.secondary">
                        Product: <strong>{poData.productName}</strong>
                    </Typography>
                    <TextField
                        name="quantity"
                        label="Quantity to Order"
                        type="number"
                        inputProps={{ min: 1 }}
                        value={poData.quantity}
                        onChange={(e) => setPoData(prev => ({ ...prev, quantity: e.target.value }))}
                        required
                        fullWidth
                    />
                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1, mt: 2 }}>
                        <Button variant="outlined" onClick={handleClosePoModal}>Cancel</Button>
                        <Button variant="contained" color="success" type="submit">
                            Submit PO
                        </Button>
                    </Box>
                </Box>
            </Modal>
            {/* --- END NEW Purchase Order Modal --- */}
        </Box>
    );
}

export default ForecastPage;