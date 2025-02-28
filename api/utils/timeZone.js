export const convertToEST = (date) => {
    if (!date) return null;
    return new Date(date).toLocaleString("en-US", { timeZone: "America/New_York" });
};

export const timeStampConfig = {
    timestamps: true,
    getterMethods: {
        formattedCreatedAt() {
            return convertToEST(this.getDataValue('createdAt'));
        },
        formattedUpdatedAt() {
            return convertToEST(this.getDataValue('updatedAt'));
        }
    }
};
