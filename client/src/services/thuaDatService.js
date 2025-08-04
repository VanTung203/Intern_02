// File: client/src/services/thuaDatService.js

import apiClient from '../api/apiClient';

const lookupThuaDat = (soTo, soThua) => {
    return apiClient.get('/ThuaDat/lookup', {
        params: {
            soTo,
            soThua
        }
    });
};

const thuaDatService = {
    lookupThuaDat,
};

export default thuaDatService;