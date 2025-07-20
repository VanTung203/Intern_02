import React, { useState, useEffect } from 'react';
import { Grid, FormControl, InputLabel, Select, MenuItem, CircularProgress } from '@mui/material';
import locationService from '../../services/locationService';

const LocationSelector = ({ onLocationChange }) => {
    const [provinces, setProvinces] = useState([]);
    const [districts, setDistricts] = useState([]);
    const [wards, setWards] = useState([]);

    const [selectedProvince, setSelectedProvince] = useState('');
    const [selectedDistrict, setSelectedDistrict] = useState('');
    const [selectedWard, setSelectedWard] = useState('');

    const [loading, setLoading] = useState({
        provinces: true,
        districts: false,
        wards: false,
    });

    // Tải danh sách tỉnh/thành phố khi component được mount
    useEffect(() => {
        const fetchProvinces = async () => {
            try {
                const response = await locationService.getProvinces();
                setProvinces(response.data);
            } catch (error) {
                console.error("Failed to fetch provinces:", error);
            } finally {
                setLoading(prev => ({ ...prev, provinces: false }));
            }
        };
        fetchProvinces();
    }, []);

    // Tải danh sách quận/huyện khi tỉnh/thành phố thay đổi
    useEffect(() => {
        if (!selectedProvince) {
            setDistricts([]);
            setWards([]);
            setSelectedDistrict('');
            setSelectedWard('');
            return;
        }
        const fetchDistricts = async () => {
            setLoading(prev => ({ ...prev, districts: true }));
            setWards([]);
            setSelectedDistrict('');
            setSelectedWard('');
            try {
                const response = await locationService.getDistrictsByProvinceCode(selectedProvince);
                setDistricts(response.data.districts);
            } catch (error) {
                console.error("Failed to fetch districts:", error);
            } finally {
                setLoading(prev => ({ ...prev, districts: false }));
            }
        };
        fetchDistricts();
    }, [selectedProvince]);

    // Tải danh sách phường/xã khi quận/huyện thay đổi
    useEffect(() => {
        if (!selectedDistrict) {
            setWards([]);
            setSelectedWard('');
            return;
        }
        const fetchWards = async () => {
            setLoading(prev => ({ ...prev, wards: true }));
            setSelectedWard('');
            try {
                const response = await locationService.getWardsByDistrictCode(selectedDistrict);
                setWards(response.data.wards);
            } catch (error) {
                console.error("Failed to fetch wards:", error);
            } finally {
                setLoading(prev => ({ ...prev, wards: false }));
            }
        };
        fetchWards();
    }, [selectedDistrict]);

    // Báo cho component cha khi địa chỉ đầy đủ được chọn
    useEffect(() => {
        if (selectedProvince && selectedDistrict && selectedWard) {
            const locationData = {
                province: provinces.find(p => p.code === selectedProvince)?.name,
                district: districts.find(d => d.code === selectedDistrict)?.name,
                ward: wards.find(w => w.code === selectedWard)?.name,
            };
            onLocationChange(locationData);
        }
    }, [selectedProvince, selectedDistrict, selectedWard, provinces, districts, wards, onLocationChange]);


    return (
        <Grid container spacing={2} sx={{ mb: 2 }}>
            <Grid item xs={12} sm={4}>
                <FormControl fullWidth>
                    <InputLabel>Tỉnh/Thành phố *</InputLabel>
                    <Select
                        value={selectedProvince}
                        label="Tỉnh/Thành phố *"
                        onChange={(e) => setSelectedProvince(e.target.value)}
                        disabled={loading.provinces}
                    >
                        {loading.provinces && <MenuItem value=""><CircularProgress size={20} /></MenuItem>}
                        {provinces.map((province) => (
                            <MenuItem key={province.code} value={province.code}>
                                {province.name}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>
            </Grid>
            <Grid item xs={12} sm={4}>
                <FormControl fullWidth disabled={!selectedProvince || loading.districts}>
                    <InputLabel>Quận/Huyện *</InputLabel>
                    <Select
                        value={selectedDistrict}
                        label="Quận/Huyện *"
                        onChange={(e) => setSelectedDistrict(e.target.value)}
                    >
                         {loading.districts && <MenuItem value=""><CircularProgress size={20} /></MenuItem>}
                        {districts.map((district) => (
                            <MenuItem key={district.code} value={district.code}>
                                {district.name}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>
            </Grid>
            <Grid item xs={12} sm={4}>
                <FormControl fullWidth disabled={!selectedDistrict || loading.wards}>
                    <InputLabel>Phường/Xã *</InputLabel>
                    <Select
                        value={selectedWard}
                        label="Phường/Xã *"
                        onChange={(e) => setSelectedWard(e.target.value)}
                    >
                        {loading.wards && <MenuItem value=""><CircularProgress size={20} /></MenuItem>}
                        {wards.map((ward) => (
                            <MenuItem key={ward.code} value={ward.code}>
                                {ward.name}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>
            </Grid>
        </Grid>
    );
};

export default LocationSelector;