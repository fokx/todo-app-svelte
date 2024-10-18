<script>
    import Todo from "$lib/components/todo-list.svelte";
    import {liveQuery} from "dexie";
    import {dbDexie} from "$lib/db-dexie.js";
    let todoList = liveQuery(() =>
            dbDexie.todos.toArray()
    );

    let todoListDeleted = $state();
    todoList.subscribe((todos) => {
        todoListDeleted = todos.filter(t => t.deleted);
    });

</script>

<style>
    @import '$lib/styles.css';
</style>

<div class="centered">

    <h2>Deleted TODOs:</h2>
    <a href="/">Return to Main Page</a>
    <hr>
    <Todo bind:todos={todoListDeleted} isDeletedListPage={true}/>

</div>
