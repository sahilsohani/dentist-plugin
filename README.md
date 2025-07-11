# Sleep Apnea Survey - Comprehensive Screening Tool

A professional, medical-grade sleep apnea screening application built with React, TypeScript, and modern web technologies. This comprehensive sleep apnea assessment tool provides healthcare professionals with a validated questionnaire for obstructive sleep apnea risk evaluation.

> **🚧 Work in Progress**: This project is actively being developed for a healthcare client. Current implementation includes the complete sleep apnea survey with enhanced UX. Additional features and improvements are planned for future releases.

## 🩺 About Sleep Apnea Screening

This application implements a validated screening methodology used by healthcare professionals to assess the risk of obstructive sleep apnea. The assessment evaluates 8 key clinical factors:

- **S**noring (loud snoring)
- **T**iredness (daytime fatigue)
- **O**bserved (witnessed breathing interruptions)
- **P**ressure (high blood pressure)
- **B**MI > 35 (body mass index)
- **A**ge > 50 years
- **N**eck circumference > 16 inches (40cm)
- **G**ender (male)

Each "Yes" answer scores 1 point, with higher scores indicating increased sleep apnea risk according to established clinical guidelines.

## ✨ Current Features

### 🎯 Core Functionality
- **Complete Sleep Apnea Assessment**: All 8 validated screening questions
- **Built-in BMI Calculator**: Supports both metric (cm/kg) and imperial (in/lb) units
- **Automatic Calculations**: Age and neck circumference assessments computed automatically
- **Contact Information Collection**: Secure collection of patient details
- **Real-time Validation**: Comprehensive form validation with helpful error messages

### 🎨 User Experience
- **Professional Medical Interface**: Clean, accessible design suitable for clinical environments
- **Visual Feedback**: Color-coded responses, completion badges, and smooth animations
- **Progress Tracking**: Clear indication of survey completion status
- **Responsive Design**: Optimized for desktop, tablet, and mobile devices
- **Zero Page Jumping**: Stable scroll position throughout the entire survey experience

### 🔧 Technical Excellence
- **Performance Optimized**: No unnecessary re-renders or layout shifts
- **Accessibility Compliant**: ARIA labels, keyboard navigation, proper focus management
- **Type Safety**: Full TypeScript implementation with comprehensive type definitions
- **Modern React Patterns**: Hooks, memoization, and optimized component architecture

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm
- Modern web browser

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/apnea-survey.git
   cd apnea-survey
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```

4. **Open in browser**
   ```
   http://localhost:5173
   ```

### Build for Production
```bash
npm run build
npm run preview
```

## 🛠️ Tech Stack

- **Frontend Framework**: React 18
- **Language**: TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **Form Management**: React Hook Form
- **Utilities**: ClassNames
- **Development**: ESLint, Modern JavaScript

## 📁 Project Structure

```
apnea-survey/
├── src/
│   ├── components/
│   │   └── SleepApneaSurvey.tsx    # Main survey component
│   ├── App.tsx                     # Application root
│   ├── index.css                   # Global styles & Tailwind config
│   └── main.tsx                    # Application entry point
├── public/
│   └── vite.svg                    # Vite logo
├── package.json                    # Dependencies & scripts
├── vite.config.ts                  # Vite configuration
├── tailwind.config.js              # Tailwind CSS configuration
├── tsconfig.json                   # TypeScript configuration
└── eslint.config.js                # ESLint configuration
```

## 🎯 Key Components

### SleepApneaSurvey Component
The main survey component featuring:
- **YesNoQuestion**: Reusable question component with enhanced UI
- **BMICalculator**: Isolated calculator with unit conversion
- **ContactFields**: Independent contact form with validation
- **Progress Tracking**: Visual progress indicators
- **Form Validation**: Complete form validation before submission

### Enhanced Form Features
- **Smart Validation**: "No" answers are valid responses (medical accuracy)
- **Auto-calculations**: BMI, age, and neck size assessments
- **Contact Validation**: Name, email, and phone number validation
- **Submission Handling**: Complete form validation with clinical scoring

## 🔒 Privacy & Security

- **Data Confidentiality**: Clear privacy notices and data handling information
- **No External Dependencies**: All calculations performed client-side
- **Form Security**: Input validation and sanitization
- **Medical Compliance**: Professional-grade interface suitable for healthcare settings

## 🎨 Design Philosophy

### Medical-Grade Interface
- Clean, professional appearance suitable for clinical environments
- High contrast and accessible color schemes
- Clear typography and intuitive navigation
- Consistent spacing and visual hierarchy

### User-Centered Design
- Minimal cognitive load with clear instructions
- Immediate visual feedback for all interactions
- Smooth animations that enhance rather than distract
- Mobile-first responsive design

## 🚀 Performance Features

- **Zero Re-renders**: Optimized state management prevents unnecessary updates
- **Stable Scroll Position**: No page jumping during form interaction
- **Fast Loading**: Minimal bundle size with efficient code organization
- **Smooth Animations**: 60fps transitions and hover effects

## 🔧 Development Highlights

### Technical Challenges Solved
1. **Form Re-rendering**: Eliminated page position changes during form interaction
2. **Contact Field Isolation**: Independent state management for smooth typing experience
3. **BMI Calculator Stability**: Isolated calculator preventing parent component re-renders
4. **Medical Validation UX**: Proper validation where "No" answers are medically valid

### Code Quality
- **TypeScript**: Full type safety throughout the application
- **Component Architecture**: Memoized components and optimized React hooks
- **Error Handling**: Comprehensive form validation and user feedback
- **Accessibility**: WCAG compliant with proper ARIA implementation

## 📊 Browser Support

- **Modern Browsers**: Chrome 90+, Firefox 88+, Safari 14+, Edge 90+
- **Mobile**: iOS Safari 14+, Chrome Mobile 90+
- **Responsive**: Optimized for screens 320px to 4K

## 🗺️ Roadmap & Future Features

### Planned Client Enhancements
- **Results Interpretation**: Clinical scoring guidelines and risk assessment
- **Data Export**: PDF report generation and CSV export functionality
- **Backend Integration**: API connectivity for data persistence
- **Multi-language Support**: Internationalization for broader accessibility
- **Enhanced Analytics**: Detailed reporting and survey analytics
- **Print Optimization**: Print-friendly styling and layouts
- **Local Storage**: Progress saving for incomplete surveys
- **Admin Dashboard**: Healthcare provider management interface

### Technical Improvements
- **Performance Monitoring**: Advanced performance metrics and optimization
- **Testing Suite**: Comprehensive unit and integration tests
- **CI/CD Pipeline**: Automated testing and deployment workflows
- **Documentation**: Enhanced code documentation and developer guides

## 🤝 Contributing

This project is being developed for a healthcare client with specific requirements. Development contributions are managed through:

- Internal team collaboration and code reviews
- Client feedback integration and feature refinement
- Medical compliance and accessibility testing
- Performance optimization and user experience enhancement

### Development Setup
1. Fork the repository (if authorized)
2. Create a feature branch: `git checkout -b feature/client-requested-feature`
3. Make your changes and test thoroughly
4. Commit with clear messages: `git commit -m 'Add client requested feature'`
5. Push to your branch: `git push origin feature/client-requested-feature`
6. Open a Pull Request for team review

## 📄 License

This project is developed under a commercial license for healthcare client use. See LICENSE file for specific terms and usage restrictions.

## 🏥 Medical Disclaimer

This application is a screening tool and should not replace professional medical advice. The sleep apnea questionnaire is intended for healthcare professionals to assess sleep apnea risk. Users should consult with qualified healthcare providers for proper diagnosis and treatment.

## 📞 Support & Contact

For project-related inquiries and client support:
- **Internal Issues**: Use internal project management system
- **Client Communication**: Through designated client liaison
- **Technical Support**: Contact development team lead

---

**Built with ❤️ for healthcare professionals and patients seeking better sleep health assessment tools.**

