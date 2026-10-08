"use client";

import { getApp, getApps, initializeApp, type FirebaseApp } from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

export function isFirebaseClientConfigured(): boolean {
  return Boolean(
    firebaseConfig.apiKey &&
      firebaseConfig.authDomain &&
      firebaseConfig.projectId &&
      firebaseConfig.appId
  );
}

function getFirebaseApp(): FirebaseApp {
  if (!isFirebaseClientConfigured()) {
    throw new Error("Firebase is not configured");
  }

  if (getApps().length > 0) {
    return getApp();
  }

  return initializeApp({
    apiKey: firebaseConfig.apiKey!,
    authDomain: firebaseConfig.authDomain!,
    projectId: firebaseConfig.projectId!,
    appId: firebaseConfig.appId!,
  });
}

export function getFirebaseAuth(): Auth {
  return getAuth(getFirebaseApp());
}
