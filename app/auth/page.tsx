"use client";

import { useState } from "react";
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useRouter } from "next/navigation";

export default function AuthPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [name, setName] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);

  const getErrorMessage = (error: {
    code?: string;
    statusText?: string;
    message?: string;
  }) => {
    const code = error.code || error.statusText;
    const message = error.message?.toLowerCase() || "";

    if (
      code === "INVALID_EMAIL_OR_PASSWORD" ||
      message.includes("invalid email or password")
    ) {
      return "이메일 또는 비밀번호가 올바르지 않습니다.";
    }
    if (
      code === "EMAIL_ALREADY_EXISTS" ||
      message.includes("email already exists")
    ) {
      return "이미 사용 중인 이메일입니다.";
    }
    if (code === "USER_NOT_FOUND" || message.includes("user not found")) {
      return "존재하지 않는 사용자입니다.";
    }
    if (code === "WRONG_PASSWORD" || message.includes("wrong password")) {
      return "비밀번호가 틀렸습니다.";
    }

    return error.message || "인증 오류가 발생했습니다.";
  };

  const handleAuth = async () => {
    if (isSignUp) {
      if (password !== confirmPassword) {
        alert("비밀번호가 일치하지 않습니다.");
        return;
      }
      await authClient.signUp.email(
        {
          email,
          password,
          name,
        },
        {
          onSuccess: () => {
            alert("회원가입 성공! 이제 로그인해 주세요.");
            setIsSignUp(false);
          },
          onError: (ctx) => {
            alert(getErrorMessage(ctx.error));
          },
        },
      );
    } else {
      await authClient.signIn.email(
        {
          email,
          password,
        },
        {
          onSuccess: () => {
            alert("로그인 성공!");
            router.push("/");
            router.refresh();
          },
          onError: (ctx) => {
            alert(getErrorMessage(ctx.error));
          },
        },
      );
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <Card className="w-[400px]">
        <CardHeader>
          <CardTitle>{isSignUp ? "회원가입" : "로그인"}</CardTitle>
          <CardDescription>인증 시스템 테스트용 페이지입니다.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {isSignUp && (
            <div className="space-y-2">
              <label>이름</label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="홍길동"
              />
            </div>
          )}
          <div className="space-y-2">
            <label>이메일</label>
            <Input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="test@example.com"
            />
          </div>
          <div className="space-y-2">
            <label>비밀번호</label>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          {isSignUp && (
            <div className="space-y-2">
              <label>비밀번호 확인</label>
              <Input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>
          )}
        </CardContent>
        <CardFooter className="flex flex-col gap-2">
          <Button className="w-full" onClick={handleAuth}>
            {isSignUp ? "가입하기" : "로그인하기"}
          </Button>
          <Button variant="link" onClick={() => setIsSignUp(!isSignUp)}>
            {isSignUp
              ? "이미 계정이 있나요? 로그인"
              : "계정이 없나요? 회원가입"}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
