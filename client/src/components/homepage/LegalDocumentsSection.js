import React from 'react';
import { Box, Typography, Paper, List, ListItem, ListItemText, Divider } from '@mui/material';

const LegalDocumentsSection = ({ legalDocs }) => {
    return (
        <Paper elevation={3} sx={{ p: 3, height: '100%' }}>
            <Typography variant="h5" component="h2" gutterBottom sx={{ fontWeight: 'bold' }}>
                Văn bản pháp luật
            </Typography>
            <List>
                {legalDocs.map((doc, index) => (
                    <React.Fragment key={doc.id}>
                        <ListItem>
                            <ListItemText 
                                primary={doc.tieuDe}
                                secondary={`Số hiệu: ${doc.soHieuVanBan} - Ngày ban hành: ${new Date(doc.ngayBanHanh).toLocaleDateString('vi-VN')}`}
                            />
                        </ListItem>
                        {index < legalDocs.length - 1 && <Divider />}
                    </React.Fragment>
                ))}
            </List>
        </Paper>
    );
}
export default LegalDocumentsSection;