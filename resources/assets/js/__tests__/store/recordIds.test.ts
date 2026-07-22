import {newRecordId} from "@/src/store/modules/dataModule/shared";

test("new record IDs use the next integer string", () => {
    expect(newRecordId(["1", "7", "not-an-integer"])).toBe("8");
});
