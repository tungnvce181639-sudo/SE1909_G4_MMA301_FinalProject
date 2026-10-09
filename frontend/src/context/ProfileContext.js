import React, { createContext, useContext, useMemo, useState } from 'react';

const ProfileContext = createContext(null);

const defaultProfile = {
  name: 'Sinh viên FPT',
  studentId: 'Chưa cập nhật MSSV',
  major: 'Chưa cập nhật ngành học',
  avatar: null,
};

export function ProfileProvider({ children, initialProfile = defaultProfile }) {
  const [profile, setProfile] = useState(initialProfile);
  const value = useMemo(() => ({ profile, setProfile }), [profile]);

  return <ProfileContext.Provider value={value}>{children}</ProfileContext.Provider>;
}

export function useProfile() {
  return useContext(ProfileContext) || { profile: defaultProfile };
}