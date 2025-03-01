import { useGetSettingsQuery, useGetVendorsQuery } from '../services/Api'
import { useCreateTransactionMutation } from '../services/TransactionApi'
import Swal from 'sweetalert2'

const SeedDatabase = ({numTransactions=5}) => {
    const [createTransaction] = useCreateTransactionMutation()
    const { data: vendors } = useGetVendorsQuery()
    const { data: settings } = useGetSettingsQuery()

    // Get sales tax rate from settings or use default 7%
    const salesTaxRate = settings?.find(setting => setting.key === 'Sales_Tax')?.value || 7

    const getRandomDate = () => {
        const now = new Date();
        const daysAgo = Math.floor(Math.random() * 60);
        const date = new Date(now.getTime() - (daysAgo * 24 * 60 * 60 * 1000));
        return date.toISOString();
    };

    const generateRandomTransaction = () => {
        const date = getRandomDate();
        const numItems = Math.floor(Math.random() * 5) + 1;

        // Ensure we have vendors before proceeding
        if (!vendors?.length) {
            throw new Error('No vendors available');
        }

        const items = Array.from({ length: 1 }, () => {
            // Ensure price is a whole number in cents
            const priceInCents = Math.round(Math.floor(Math.random() * 10000));
            const quantity =3;

            return {
                quantity,
                price: priceInCents,
                description: `Random Item: ${Math.random().toString(36).substring(7)}`,
                vendorId: vendors[Math.floor(Math.random() * vendors.length)].id,
                createdAt: date,
            };
        });

        // Calculate totals in cents
        const subTotal = items.reduce((sum, item) =>
            sum + (Math.round(item.price) * Math.round(item.quantity)), 0
        );
        const salesTax = Math.round((subTotal * parseInt(salesTaxRate)) / 100);

        return {
            items,
            salesTax,
            paymentMethod: Math.random() < 0.5 ? 'CASH' : 'CARD',
            createdAt: date,
        };
    };

    const seedDatabase = async (e) => {
        e.preventDefault();
        try {

            let currentTransaction = 0;

            // Show loading alert
            const loadingAlert = Swal.fire({
                title: 'Seeding Database',
                html: 'Progress: <b>0%</b>',
                allowOutsideClick: false,

            });

            // Process transactions sequentially
            for (let i = 0; i < numTransactions; i++) {
                const transaction = generateRandomTransaction();

                // Wait for each transaction to complete before moving to the next
                await createTransaction(transaction).unwrap();

                currentTransaction++;
                const progress = Math.round((currentTransaction / numTransactions) * 100);

                Swal.update({
                    html: `Progress: <b>${progress}%</b><br>Transaction ${currentTransaction} of ${numTransactions}`,
                });

                // Add a small delay between transactions
                await new Promise(resolve => setTimeout(resolve, 100));
            }

            Swal.fire({
                icon: 'success',
                title: 'Success!',
                text: `Successfully created ${numTransactions} transactions`
            });
        } catch (error) {
            console.error('Seeding error:', error);
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: `Failed to seed database: ${error.message}`
            });
        }
    };

    return (
        <div className='pt-3'>
            <form onSubmit={seedDatabase}>
                <button className='btn btn-outline-success'>Seed Database</button>
            </form>
        </div>
    )
}

export default SeedDatabase
