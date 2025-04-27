import React from 'react';
import { Container, Typography, Grid, Box, Paper, Divider } from '@mui/material';
import './About.css';

const About = () => {
  return (
    <div className="about-page">
      <div className="about-hero">
        <Container maxWidth="lg">
          <Typography variant="h2" component="h1" gutterBottom>
            Về chúng tôi
          </Typography>
          <Typography variant="h5" component="p" gutterBottom>
            Chúng tôi cung cấp các sản phẩm công nghệ chất lượng cao từ Apple
          </Typography>
        </Container>
      </div>

      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Grid container spacing={6}>
          <Grid item xs={12} md={6} color={'#fff'}>
            <Typography variant="h4" component="h2" gutterBottom>
              Câu chuyện của chúng tôi
            </Typography>
            <Typography variant="body1" paragraph>
              Apple Store của chúng tôi được thành lập vào năm 2010 với mục tiêu cung cấp các sản phẩm Apple chính hãng với chất lượng tốt nhất cùng dịch vụ hỗ trợ khách hàng tận tâm.
            </Typography>
            <Typography variant="body1" paragraph>
              Với hơn 10 năm kinh nghiệm, chúng tôi đã trở thành đối tác ủy quyền của Apple tại Việt Nam, phục vụ hàng ngàn khách hàng mỗi tháng.
            </Typography>
            <Typography variant="body1" paragraph>
              Đội ngũ nhân viên chuyên nghiệp của chúng tôi luôn cập nhật những kiến thức mới nhất về sản phẩm Apple để tư vấn và hỗ trợ khách hàng một cách tốt nhất.
            </Typography>
          </Grid>
          <Grid item xs={12} md={6}>
            <Box className="about-image">
              <img src="https://placehold.co/600x400/333/fff?text=Apple+Store+Team" alt="Apple Store Team" />
            </Box>
          </Grid>
        </Grid>

        <Divider sx={{ my: 8 }} />

        <Typography color='#fff' variant="h4" component="h2" gutterBottom align="center" sx={{ mb: 6 }}>
          Giá trị cốt lõi
        </Typography>

        <Grid container spacing={4}>
          <Grid item xs={12} md={4}>
            <Paper className="core-value-card" elevation={0}>
              <Typography variant="h5" component="h3" gutterBottom>
                Chất lượng
              </Typography>
              <Typography variant="body1">
                Chúng tôi cam kết cung cấp sản phẩm chính hãng với chất lượng tốt nhất. Mọi sản phẩm đều được kiểm tra kỹ lưỡng trước khi đến tay khách hàng.
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} md={4}>
            <Paper className="core-value-card" elevation={0}>
              <Typography variant="h5" component="h3" gutterBottom>
                Tận tâm
              </Typography>
              <Typography variant="body1">
                Chúng tôi luôn đặt khách hàng lên hàng đầu, lắng nghe và giải quyết mọi vấn đề của khách hàng một cách nhanh chóng và hiệu quả nhất.
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} md={4}>
            <Paper className="core-value-card" elevation={0}>
              <Typography variant="h5" component="h3" gutterBottom>
                Sáng tạo
              </Typography>
              <Typography variant="body1">
                Chúng tôi không ngừng đổi mới để mang đến trải nghiệm mua sắm tốt nhất cho khách hàng, từ website đến cửa hàng vật lý.
              </Typography>
            </Paper>
          </Grid>
        </Grid>

        <Divider sx={{ my: 8 }} />

        <div className="contact-section">
          <Typography variant="h4" color='#fff' component="h2" gutterBottom align="center" sx={{ mb: 6 }}>
            Liên hệ với chúng tôi
          </Typography>

          <Grid container spacing={4}>
            <Grid item xs={12} md={4}>
              <Typography variant="h6" gutterBottom>
                Địa chỉ
              </Typography>
              <Typography variant="body1">
                123 Đường Nguyễn Huệ<br />
                Quận 1, TP. Hồ Chí Minh<br />
                Việt Nam
              </Typography>
            </Grid>
            <Grid item xs={12} md={4}>
              <Typography variant="h6" gutterBottom>
                Liên hệ
              </Typography>
              <Typography variant="body1">
                Điện thoại: (028) 1234 5678<br />
                Email: info@applestore.vn<br />
                Hotline: 1900 1234
              </Typography>
            </Grid>
            <Grid item xs={12} md={4}>
              <Typography variant="h6" gutterBottom>
                Giờ làm việc
              </Typography>
              <Typography variant="body1">
                Thứ 2 - Thứ 6: 8:00 - 21:00<br />
                Thứ 7 - Chủ nhật: 9:00 - 21:00<br />
                Ngày lễ: 9:00 - 20:00
              </Typography>
            </Grid>
          </Grid>
        </div>
      </Container>
    </div>
  );
};

export default About; 