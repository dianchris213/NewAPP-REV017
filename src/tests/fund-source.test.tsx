import { describe, expect, it } from "vitest";
import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AppProvider, useApp } from "@/lib/app-store";
import { FundSourceSheet } from "@/routes/settings";

function Harness() {
  const { wallets, activity, addTransaction } = useApp();
  return (
    <div>
      <FundSourceSheet onClose={() => {}} />
      <span data-testid="wallet-count">{wallets.length}</span>
      <span data-testid="activity-log">{activity.map((a) => a.title).join("|")}</span>
      <button
        type="button"
        data-testid="use-first-wallet"
        onClick={() => {
          const first = wallets[0];
          if (!first) return;
          addTransaction({
            type: "expense",
            amount: 1000,
            category: "Transport",
            note: "test",
            date: new Date().toISOString(),
            walletId: first.id,
          });
        }}
      >
        use
      </button>
    </div>
  );
}

async function setup() {
  const user = userEvent.setup();
  render(
    <AppProvider>
      <Harness />
    </AppProvider>,
  );
  return user;
}

async function addSource(user: ReturnType<typeof userEvent.setup>, name: string) {
  const input = screen.getByTestId("fund-source-name");
  await user.clear(input);
  await user.type(input, name);
  await user.click(screen.getByTestId("fund-source-submit"));
}

describe("Kartu Sumber Dana", () => {
  it("focuses the name field when the sheet opens", async () => {
    await setup();
    await waitFor(() => expect(screen.getByTestId("fund-source-name")).toHaveFocus());
  });

  it("rejects names shorter than 2 characters", async () => {
    const user = await setup();
    await addSource(user, "A");
    expect(await screen.findByTestId("fund-source-form-error")).toBeInTheDocument();
    expect(screen.getByTestId("wallet-count")).toHaveTextContent("0");
  });

  it("adds a valid fund source and records an audit entry", async () => {
    const user = await setup();
    await addSource(user, "Dompet Utama");
    await waitFor(() => expect(screen.getByTestId("wallet-count")).toHaveTextContent("1"));
    expect(screen.getByTestId("activity-log")).toHaveTextContent("Sumber Dana Dibuat");
  });

  it("rejects duplicate names (case-insensitive)", async () => {
    const user = await setup();
    await addSource(user, "Dompet Utama");
    await waitFor(() => expect(screen.getByTestId("wallet-count")).toHaveTextContent("1"));
    await addSource(user, "dompet utama");
    expect(await screen.findByTestId("fund-source-form-error")).toBeInTheDocument();
    expect(screen.getByTestId("wallet-count")).toHaveTextContent("1");
  });

  it("renames a fund source and logs the change", async () => {
    const user = await setup();
    await addSource(user, "Dompet Utama");
    await waitFor(() => expect(screen.getByTestId("wallet-count")).toHaveTextContent("1"));

    const renameBtn = await screen.findByRole("button", { name: /Dompet Utama/i });
    await user.click(renameBtn);
    const editor = screen.getByRole("textbox", { name: /Dompet Utama/i });
    await user.clear(editor);
    await user.type(editor, "Dompet Kedua{Enter}");

    await waitFor(() => expect(screen.getByText("Dompet Kedua")).toBeInTheDocument());
    expect(screen.getByTestId("activity-log")).toHaveTextContent("Sumber Dana Diubah");
  });

  it("deletes an unused fund source", async () => {
    const user = await setup();
    await addSource(user, "Dompet Utama");
    await waitFor(() => expect(screen.getByTestId("wallet-count")).toHaveTextContent("1"));
    const list = screen.getByRole("list", { name: /sumber dana/i });
    await user.click(within(list).getByRole("button", { name: /hapus/i }));
    await waitFor(() => expect(screen.getByTestId("wallet-count")).toHaveTextContent("0"));
    expect(screen.getByTestId("activity-log")).toHaveTextContent("Sumber Dana Dihapus");
  });

  it("blocks deletion while the fund source is in use", async () => {
    const user = await setup();
    await addSource(user, "Dompet Utama");
    await waitFor(() => expect(screen.getByTestId("wallet-count")).toHaveTextContent("1"));
    await user.click(screen.getByTestId("use-first-wallet"));

    const list = screen.getByRole("list", { name: /sumber dana/i });
    await user.click(within(list).getByRole("button", { name: /hapus/i }));
    await waitFor(() => expect(screen.getByRole("alert")).toBeInTheDocument());
    expect(screen.getByTestId("wallet-count")).toHaveTextContent("1");
  });
});
