# MAPPER METHODS REFERENCE

## CourseRegistrationMapper

**Type:** `@Component`

**Dependencies:**
- userRepository: UserRepository (private)

**Methods:**
```
+ toResponse(CourseRegistration cr): CourseRegistrationResponse
+ toEnrollmentResponse(CourseRegistration cr): EnrollmentResponse
- buildFullName(User u): String
```

---

## FromDatacoreMapper

**Type:** `@Mapper(componentModel="spring")` (MapStruct Interface)

**Methods:**
```
+ toUser(RecvDatacoreDto dto): User
+ toStudent(RecvDatacoreDto dto): Student
+ toUniversityStaff(RecvDatacoreDto dto): UniversityStaff
+ stringToUserType(String userTypeString): UserType [@Named("stringToUserType")]
```

**Mappings:**
- `toUser`: userType → userType (with stringToUserType converter)
- `toStudent`: officialID → studentId
- `toUniversityStaff`: officialID → staffId

---

## ToFEUserMapper

**Type:** `@Mapper(componentModel="spring")` (MapStruct Interface)

**Methods:**
```
+ toFEUserDtoMapper(RecvDatacoreDto recvDatacoreDto): ToFEUserDto
+ fromDBtoFEUserDto(Optional<User> user): ToFEUserDto
+ toLowerCase(String s): String [@Named("toLowerCase")]
```

**Mappings:**
- `toFEUserDtoMapper`: userType → userType (with toLowerCase converter)

---

**Note:**
- `+` = public method
- `-` = private method
- MapStruct mappers are interfaces that generate implementation at compile time
- `@Named` annotations identify custom mapping methods
