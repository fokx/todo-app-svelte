<script>
    import Todo from "$lib/components/todo-list.svelte";
    import {liveQuery} from "dexie";
    import {dbDexie} from "$lib/db-dexie.js";

    let todoListDeleted = liveQuery(() =>
            dbDexie.todos.where({'deleted': 'true'}).toArray()
        // async () => {return await dbDexie.todos.where("deleted").equals('false').toArray()}
    );
</script>
<Todo bind:todos={$todoListDeleted} isDeletedListPage={true}/>
