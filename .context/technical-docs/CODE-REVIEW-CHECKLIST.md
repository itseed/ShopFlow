# Code Review Checklist

Checklist สำหรับตรวจสอบ code quality ใน ShopFlow

## 📋 General Code Quality

### TypeScript

- [ ] ไม่มี TypeScript errors (`npm run type-check` ผ่าน)
- [ ] ไม่ใช้ `any` type (ยกเว้นกรณีจำเป็น)
- [ ] Type definitions ครบถ้วนและถูกต้อง
- [ ] ใช้ type inference ที่เหมาะสม
- [ ] Interface/Type definitions อยู่ใน packages/types

### Code Style

- [ ] ใช้ ESLint และผ่านการตรวจสอบ (`npm run lint` ผ่าน)
- [ ] Code formatting สอดคล้องกับ project style
- [ ] ไม่มี unused variables หรือ imports
- [ ] Function และ variable names ชัดเจนและสื่อความหมาย
- [ ] Comments ครบถ้วนสำหรับ complex logic

### Error Handling

- [ ] มี error handling ที่เหมาะสม
- [ ] ใช้ try-catch สำหรับ async operations
- [ ] Error messages ชัดเจนและเป็นประโยชน์
- [ ] มี error boundaries ใน React components
- [ ] API errors ถูก handle และแสดงผลให้ user

## 🏗️ Architecture

### File Structure

- [ ] Files อยู่ในตำแหน่งที่ถูกต้องตามโครงสร้าง
- [ ] Components แยกตามหน้าที่ชัดเจน
- [ ] Shared code อยู่ใน packages/
- [ ] ไม่มี circular dependencies

### Dependencies

- [ ] ใช้ shared packages (@shopflow/api, @shopflow/hooks, etc.)
- [ ] ไม่มี duplicate dependencies
- [ ] Dependencies อยู่ใน package.json ที่ถูกต้อง
- [ ] Version ของ dependencies ตรงกัน

### API Integration

- [ ] ใช้ services จาก @shopflow/api
- [ ] API calls มี error handling
- [ ] ใช้ React Query hooks จาก @shopflow/hooks
- [ ] ไม่มี direct Supabase calls (ใช้ผ่าน services)

## ⚛️ React Components

### Component Structure

- [ ] Components แยกตาม single responsibility
- [ ] Props types ถูกต้องและครบถ้วน
- [ ] ใช้ TypeScript สำหรับ component props
- [ ] Components reusable และไม่ tightly coupled

### State Management

- [ ] ใช้ React Query สำหรับ server state
- [ ] Local state ใช้ useState/useReducer อย่างเหมาะสม
- [ ] ไม่มี unnecessary re-renders
- [ ] Context ใช้เฉพาะเมื่อจำเป็น

### Performance

- [ ] ใช้ React.memo, useMemo, useCallback เมื่อเหมาะสม
- [ ] ไม่มี infinite loops
- [ ] Images และ assets ถูก optimize
- [ ] Code splitting ใช้เมื่อเหมาะสม

## 🗄️ Database

### Queries

- [ ] Queries มี indexes ที่เหมาะสม
- [ ] ไม่มี N+1 query problems
- [ ] ใช้ pagination สำหรับ large datasets
- [ ] Queries มี error handling

### Data Validation

- [ ] Input validation ครบถ้วน
- [ ] Type validation ก่อน save ลง database
- [ ] ใช้ constraints ใน database schema

## 🔒 Security

### Authentication & Authorization

- [ ] Authentication ถูกต้องและปลอดภัย
- [ ] Role-based access control ทำงานถูกต้อง
- [ ] Protected routes มี authentication check
- [ ] API endpoints มี authorization check

### Data Protection

- [ ] Sensitive data ไม่ถูก expose ใน client
- [ ] Environment variables ใช้อย่างถูกต้อง
- [ ] API keys ไม่ถูก commit ลง Git
- [ ] Input sanitization สำหรับ user input

## 🧪 Testing

### Code Coverage

- [ ] Critical paths มี tests
- [ ] API services มี unit tests
- [ ] Components มี component tests
- [ ] Integration tests สำหรับ important flows

### Test Quality

- [ ] Tests ครอบคลุม edge cases
- [ ] Tests มี clear descriptions
- [ ] Tests ไม่มี flaky behavior
- [ ] Tests run ได้อย่างรวดเร็ว

## 📝 Documentation

### Code Documentation

- [ ] Functions และ classes มี JSDoc comments
- [ ] Complex logic มี inline comments
- [ ] README files ครบถ้วนและอัพเดท
- [ ] API documentation ครบถ้วน

### User Documentation

- [ ] Installation guide ครบถ้วน
- [ ] Usage examples มีให้
- [ ] Troubleshooting guide ครอบคลุม

## 🚀 Deployment

### Build & Deployment

- [ ] Build ผ่านโดยไม่มี errors
- [ ] Docker images build สำเร็จ
- [ ] Environment variables ถูกต้อง
- [ ] Health checks ทำงานได้

### Production Readiness

- [ ] Error logging ตั้งค่าไว้
- [ ] Performance monitoring มี
- [ ] Backup strategy มี
- [ ] Rollback plan มี

## ✅ Pre-Merge Checklist

ก่อน merge code ตรวจสอบ:

- [ ] All checks pass (TypeScript, ESLint, Build)
- [ ] Code review ผ่าน
- [ ] Tests ผ่านทั้งหมด
- [ ] Documentation อัพเดท
- [ ] No breaking changes (หรือมี migration guide)
- [ ] Performance ไม่แย่ลง
- [ ] Security review ผ่าน

## 📊 Review Metrics

### Code Quality Score

- **TypeScript Errors**: 0 errors
- **ESLint Errors**: 0 errors
- **Build Status**: ✅ Passing
- **Test Coverage**: > 80%
- **Documentation**: Complete

### Performance Metrics

- **Bundle Size**: < 500KB
- **Page Load Time**: < 2 seconds
- **API Response Time**: < 500ms
- **Memory Usage**: < 100MB

---

**Last Updated**: 2025-01-18

