import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

const { navigate, api } = vi.hoisted(() => ({
    navigate: vi.fn(),
    api: {
        get: vi.fn().mockResolvedValue({ data: { categories: [{ _id: "cat-1", name: "Hardware" }] } }),
        post: vi.fn()
    }
}));

vi.mock("react-router-dom", () => ({
    useNavigate: () => navigate
}));

vi.mock("../services/api", () => ({ default: api }));

import CreateRequest from "../pages/user/CreateRequest";

describe("Create request form", () => {
    it("rejects an attachment with an unsupported MIME type", async () => {
        render(<CreateRequest />);
        await waitFor(() => expect(api.get).toHaveBeenCalled());

        const file = new File(["unsafe"], "payload.exe", { type: "application/octet-stream" });
        fireEvent.change(screen.getByLabelText(/attachment/i), { target: { files: [file] } });

        expect(screen.getByText(/only jpg, png, webp, pdf, doc, and docx files are allowed/i)).toBeInTheDocument();
        expect(api.post).not.toHaveBeenCalled();
    });
});
