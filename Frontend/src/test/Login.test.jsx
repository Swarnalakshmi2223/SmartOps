import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi, beforeEach } from "vitest";

const navigate = vi.fn();
const login = vi.fn();

vi.mock("react-router-dom", () => ({
    useNavigate: () => navigate
}));

vi.mock("../context/AuthContext", () => ({
    useAuth: () => ({ login })
}));

import Login from "../pages/auth/Login";

describe("Login form", () => {
    beforeEach(() => {
        navigate.mockReset();
        login.mockReset();
    });

    it("shows a validation message when required fields are empty", () => {
        render(<Login />);
        fireEvent.click(screen.getByRole("button", { name: "Sign In", exact: true }));
        expect(screen.getByRole("alert")).toHaveTextContent(/email and password/i);
        expect(login).not.toHaveBeenCalled();
    });

    it("routes an administrator to the administrator dashboard after login", async () => {
        login.mockResolvedValue({ user: { role: "admin" } });
        render(<Login />);

        fireEvent.change(screen.getByLabelText(/email/i), { target: { value: "admin@example.com" } });
        fireEvent.change(screen.getByLabelText("Password", { selector: "input" }), { target: { value: "Password1!" } });
        fireEvent.click(screen.getByRole("button", { name: "Sign In", exact: true }));

        await waitFor(() => expect(navigate).toHaveBeenCalledWith("/admin"));
    });

    it("shows the API error without exposing an implementation exception", async () => {
        login.mockRejectedValue({ response: { data: { message: "Invalid email or password" } } });
        render(<Login />);

        fireEvent.change(screen.getByLabelText(/email/i), { target: { value: "bad@example.com" } });
        fireEvent.change(screen.getByLabelText("Password", { selector: "input" }), { target: { value: "wrong" } });
        fireEvent.click(screen.getByRole("button", { name: /sign in/i }));

        await waitFor(() => expect(screen.getByRole("alert")).toHaveTextContent(/invalid email or password/i));
    });
});
